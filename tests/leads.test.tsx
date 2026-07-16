import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MicroIntakePage from '../src/components/MicroIntakePage';
import handler from '../api/leads/submit';

const { appendMock, getMock } = vi.hoisted(() => {
  return {
    appendMock: vi.fn().mockResolvedValue({ data: {} }),
    getMock: vi.fn().mockResolvedValue({
      data: {
        values: [
          [
            'Lead ID', 'Submission ID', 'Received At', 'First Name', 'Last Name',
            'Email', 'Business Name', 'Website', 'Main Challenge',
            'Attribution Source', 'Attribution Medium', 'Attribution Campaign',
            'Attribution Content', 'Attribution Term', 'Referrer', 'Landing Page',
            'Intake Status', 'Booking Status', 'Call Prep Status', 'Follow-Up Status'
          ]
        ]
      }
    })
  };
});

vi.mock('googleapis', () => {
  return {
    google: {
      auth: {
        GoogleAuth: class {}
      },
      sheets: vi.fn().mockReturnValue({
        spreadsheets: {
          values: {
            get: getMock,
            append: appendMock
          }
        }
      })
    }
  };
});

describe('Server API Boundary & Normalization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.LEAD_SUBMISSION_ALLOWED_ORIGINS = 'http://localhost:3000';
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@example.com';
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\\nMOCK\\n-----END PRIVATE KEY-----';
    process.env.GOOGLE_SHEET_ID = 'test-id';
    process.env.GOOGLE_SHEET_TAB_NAME = 'Sheet1';
  });

  const getValidReq = () => ({
    method: 'POST',
    headers: { 'content-type': 'application/json', 'origin': 'http://localhost:3000' },
    body: {
      submissionId: '550e8400-e29b-41d4-a716-446655440000',
      fullName: 'John Doe',
      email: 'john@example.com',
      mainChallenge: 'none'
    }
  });

  const getRes = () => {
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    return res;
  };

  it('valid POST request succeeds', async () => {
    const res = getRes();
    await handler(getValidReq(), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(appendMock).toHaveBeenCalled();
  });

  it('rejects GET method', async () => {
    const req = { ...getValidReq(), method: 'GET' };
    const res = getRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it('rejects incorrect Content-Type', async () => {
    const req = getValidReq();
    req.headers['content-type'] = 'text/plain';
    const res = getRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(415);
  });

  it('rejects oversized request', async () => {
    const req = getValidReq();
    req.headers['content-length'] = '20000';
    const res = getRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(413);
  });

  it('rejects missing required fields', async () => {
    const req = getValidReq();
    delete (req.body as any).email;
    const res = getRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects malformed email', async () => {
    const req = getValidReq();
    req.body.email = 'not-email';
    const res = getRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects invalid optional website URL', async () => {
    const req = getValidReq();
    (req.body as any).website = 'invalid-url';
    const res = getRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects excessive field length', async () => {
    const req = getValidReq();
    req.body.fullName = 'a'.repeat(201);
    const res = getRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects unknown authoritative-field injection', async () => {
    const req = getValidReq();
    (req.body as any).intakeStatus = 'HACKED';
    const res = getRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(appendMock).not.toHaveBeenCalled();
  });

  it('rejects honeypot behavior', async () => {
    const req = getValidReq();
    (req.body as any).honeypot = 'bot';
    const res = getRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(appendMock).not.toHaveBeenCalled();
  });

  it('rejects missing Origin', async () => {
    const req = getValidReq();
    delete (req.headers as any).origin;
    const res = getRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('rejects disallowed Origin', async () => {
    const req = getValidReq();
    req.headers.origin = 'http://evil.com';
    const res = getRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('normalizes whitespace and email', async () => {
    const req = getValidReq();
    req.body.fullName = '  Jane Doe  ';
    req.body.email = ' UPPER@example.com ';
    const res = getRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const row = appendMock.mock.calls[0][0].requestBody.values[0];
    expect(row).toContain('upper@example.com');
  });

  it('defends against formula injection', async () => {
    const req = getValidReq();
    req.body.fullName = '=SUM(1,2)';
    (req.body as any).businessName = '+hack';
    req.body.mainChallenge = '-minus';
    (req.body as any).attribution = { source: '@bad' };
    const res = getRes();
    await handler(req, res);
    const row = appendMock.mock.calls[0][0].requestBody.values[0];
    expect(row[3]).toBe("'=" + 'SUM(1,2)'); // first name mapping
    expect(row[4]).toBe(""); // last name mapping
    expect(row[6]).toBe("'+hack");
    expect(row[8]).toBe("'-minus");
    expect(row[9]).toBe("'@bad");
  });
});

describe('Google Sheets Adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.LEAD_SUBMISSION_ALLOWED_ORIGINS = 'http://localhost:3000';
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@example.com';
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\\nMOCK\\n-----END PRIVATE KEY-----';
    process.env.GOOGLE_SHEET_ID = 'test-id';
    process.env.GOOGLE_SHEET_TAB_NAME = 'Sheet1';
  });

  const getValidReq = () => ({
    method: 'POST',
    headers: { 'content-type': 'application/json', 'origin': 'http://localhost:3000' },
    body: {
      submissionId: '550e8400-e29b-41d4-a716-446655440000',
      fullName: 'John Doe',
      email: 'john@example.com',
      mainChallenge: 'none'
    }
  });

  it('empty sheet receives exact headers', async () => {
    getMock.mockResolvedValueOnce({ data: { values: [] } });
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await handler(getValidReq(), res);
    expect(appendMock).toHaveBeenCalledTimes(2); // One for header, one for data
    expect(appendMock.mock.calls[0][0].requestBody.values[0][0]).toBe('Lead ID');
  });

  it('incompatible non-empty header fails closed', async () => {
    getMock.mockResolvedValueOnce({ data: { values: [['Wrong Header']] } });
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await handler(getValidReq(), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('provider error becomes generic API response', async () => {
    getMock.mockRejectedValueOnce(new Error('Google API fail'));
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await handler(getValidReq(), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('duplicate Submission ID returns existing Lead ID', async () => {
    getMock.mockResolvedValueOnce({
      data: {
        values: [
          [
            'Lead ID', 'Submission ID', 'Received At', 'First Name', 'Last Name',
            'Email', 'Business Name', 'Website', 'Main Challenge',
            'Attribution Source', 'Attribution Medium', 'Attribution Campaign',
            'Attribution Content', 'Attribution Term', 'Referrer', 'Landing Page',
            'Intake Status', 'Booking Status', 'Call Prep Status', 'Follow-Up Status'
          ],
          ['existing-lead-id', '550e8400-e29b-41d4-a716-446655440000']
        ]
      }
    });
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await handler(getValidReq(), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ duplicate: true, leadId: 'existing-lead-id' }));
    expect(appendMock).not.toHaveBeenCalled();
  });
});

describe('MicroIntake Form', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true
    });
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('failure preserves values and does not navigate', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ ok: false, error: { message: 'Validation failed' } })
    }));

    render(
      <MemoryRouter>
        <MicroIntakePage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Full Name \*/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Business Email \*/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Main Growth Challenge \*/i), { target: { value: 'Growth issue' } });

    fireEvent.click(screen.getByRole('button', { name: /See Available Times/i }));

    await waitFor(() => {
      expect(screen.getByText(/Failed to persist lead: Validation failed/i)).toBeDefined();
    });

    expect(window.location.href).toBe('');
    expect((screen.getByLabelText(/Full Name \*/i) as HTMLInputElement).value).toBe('Test User');
  });

  it('success navigates and does not put name/PII in URL', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ ok: true, leadId: 'test-lead-id' })
    }));

    render(
      <MemoryRouter>
        <MicroIntakePage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Full Name \*/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Business Email \*/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Main Growth Challenge \*/i), { target: { value: 'Growth issue' } });

    const btn = screen.getByRole('button', { name: /See Available Times/i });
    fireEvent.click(btn);

    // Prevents rapid clicks (button is disabled while processing)
    expect(btn).toHaveProperty('disabled', true);
    expect(screen.getByText(/Processing/i)).toBeDefined();

    await waitFor(() => {
      expect(window.location.href).toBe('https://zcal.co/danielortizceo/10min');
    });

    expect(sessionStorage.getItem('sg_lead_id')).toBe('test-lead-id');
  });
});
