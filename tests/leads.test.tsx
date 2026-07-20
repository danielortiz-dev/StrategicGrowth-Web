import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MicroIntakePage from '../src/components/MicroIntakePage';
import handler from '../api/leads/submit';

const { appendMock, getMock } = vi.hoisted(() => {
  return {
    appendMock: vi.fn().mockResolvedValue({ data: { updates: { updatedRange: "'Sheet1'!A2:T2" } } }),
    getMock: vi.fn().mockImplementation(async (opts) => {
      // Mock for read-after-write verification
      if (opts.range.includes(':B')) {
        return {
          data: {
            values: [['test-lead-id', '550e8400-e29b-41d4-a716-446655440000']]
          }
        };
      }
      return {
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
      };
    })
  };
});

vi.mock('googleapis', () => {
  return {
    google: {
      auth: {
        GoogleAuth: class {
          constructor(public opts: any) {
            if (opts.credentials.private_key === '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----') {
              (global as any).privateKeyNormalized = true;
            }
          }
        }
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

// Since handler imports uuidv4 which we need to match in read-after-write, let's mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('test-lead-id')
}));

describe('Server API Validation & Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.LEAD_SUBMISSION_ALLOWED_ORIGINS = 'http://localhost:3000, https://preview.vercel.app';
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@example.com';
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\\nMOCK\\n-----END PRIVATE KEY-----';
    process.env.GOOGLE_SHEET_ID = 'test-id';
    process.env.GOOGLE_SHEET_TAB_NAME = "Daniel's Leads";
    (global as any).privateKeyNormalized = false;
  });

  const getValidReq = () => ({
    method: 'POST',
    headers: { 'content-type': 'application/json', 'origin': 'http://localhost:3000' },
    body: {
      submissionId: '550e8400-e29b-41d4-a716-446655440000',
      fullName: 'John Doe',
      email: 'john@example.com',
      mainChallenge: 'I need more leads'
    }
  });

  const getRes = () => {
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    return res;
  };

  it('private-key newline normalization', async () => {
    const res = getRes();
    await handler(getValidReq(), res);
    expect((global as any).privateKeyNormalized).toBe(true);
  });

  it('malformed Content-Length', async () => {
    const req = getValidReq();
    req.headers['content-length'] = '-1';
    const res = getRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(413);

    req.headers['content-length'] = 'not-a-number';
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(413);
  });

  it('actual UTF-8 byte limit', async () => {
    const req = getValidReq();
    req.body.mainChallenge = 'a'.repeat(20000);
    const res = getRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(413);
  });

  it('missing origin configuration', async () => {
    process.env.LEAD_SUBMISSION_ALLOWED_ORIGINS = '';
    const res = getRes();
    await handler(getValidReq(), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('wildcard origin configuration fails closed', async () => {
    process.env.LEAD_SUBMISSION_ALLOWED_ORIGINS = '*';
    const res = getRes();
    await handler(getValidReq(), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('trailing-slash origin normalization', async () => {
    const req = getValidReq();
    req.headers.origin = 'https://preview.vercel.app/';
    const res = getRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('disallowed sibling Vercel origin', async () => {
    const req = getValidReq();
    req.headers.origin = 'https://evil-sibling.vercel.app';
    const res = getRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('Production origins accepted when listed in allowlist', async () => {
    process.env.LEAD_SUBMISSION_ALLOWED_ORIGINS = 'https://strategicgrowthhq.vercel.app, https://strategicgrowthhq-theta.vercel.app';
    process.env.VERCEL_ENV = 'production';

    let req = getValidReq();
    req.headers.origin = 'https://strategicgrowthhq.vercel.app';
    let res = getRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    req = getValidReq();
    req.headers.origin = 'https://strategicgrowthhq-theta.vercel.app';
    res = getRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('Dynamic preview variables ignored in production mode', async () => {
    process.env.LEAD_SUBMISSION_ALLOWED_ORIGINS = 'https://strategicgrowthhq.vercel.app';
    process.env.VERCEL_ENV = 'production';
    process.env.VERCEL_URL = 'dynamic.vercel.app';
    process.env.VERCEL_BRANCH_URL = 'branch.vercel.app';

    let req = getValidReq();
    req.headers.origin = 'https://dynamic.vercel.app';
    let res = getRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(403);

    req = getValidReq();
    req.headers.origin = 'https://branch.vercel.app';
    res = getRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('HTTP origin is rejected', async () => {
    process.env.LEAD_SUBMISSION_ALLOWED_ORIGINS = 'https://strategicgrowthhq.vercel.app';
    const req = getValidReq();
    req.headers.origin = 'http://strategicgrowthhq.vercel.app';
    const res = getRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('Hostname suffix attack is rejected', async () => {
    process.env.LEAD_SUBMISSION_ALLOWED_ORIGINS = 'https://strategicgrowthhq.vercel.app';
    const req = getValidReq();
    req.headers.origin = 'https://strategicgrowthhq.vercel.app.malicious.com';
    const res = getRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('invalid request makes no Google call', async () => {
    const req = getValidReq();
    delete (req.body as any).email;
    const res = getRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(appendMock).not.toHaveBeenCalled();
    expect(getMock).not.toHaveBeenCalled();
  });

  it('generic public validation response', async () => {
    const req = getValidReq();
    delete (req.body as any).email;
    const res = getRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({ message: 'Validation failed. Please ensure all required fields are correctly formatted.' })
    }));
  });

  it('empty string fails validation (non-empty validation)', async () => {
    const req = getValidReq();
    req.body.fullName = '   ';
    const res = getRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('Google Sheets Adapter details', () => {
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

  it('Empty worksheet: headers to A1, lead row to A1 (Google Sheets append behavior)', async () => {
    getMock.mockImplementation(async (opts) => {
      if (opts.range.includes(':B')) {
        return { data: { values: [['test-lead-id', '550e8400-e29b-41d4-a716-446655440000']] } };
      }
      // Return empty sheet
      return { data: { values: [] } };
    });
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await handler(getValidReq(), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(appendMock).toHaveBeenCalledTimes(2);
    expect(appendMock.mock.calls[0][0].range).toBe("'Sheet1'!A1");
    expect(appendMock.mock.calls[0][0].requestBody.values[0][0]).toBe('Lead ID');
    expect(appendMock.mock.calls[1][0].range).toBe("'Sheet1'!A1");
  });

  it('Existing headers with no data: headers not rewritten, lead row appended', async () => {
    const expectedHeaders = ['Lead ID', 'Submission ID', 'Received At', 'First Name', 'Last Name', 'Email', 'Business Name', 'Website', 'Main Challenge', 'Attribution Source', 'Attribution Medium', 'Attribution Campaign', 'Attribution Content', 'Attribution Term', 'Referrer', 'Landing Page', 'Intake Status', 'Booking Status', 'Call Prep Status', 'Follow-Up Status'];
    getMock.mockImplementation(async (opts) => {
      if (opts.range.includes(':B')) {
        return { data: { values: [['test-lead-id', '550e8400-e29b-41d4-a716-446655440000']] } };
      }
      return { data: { values: [expectedHeaders] } };
    });
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await handler(getValidReq(), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(appendMock).toHaveBeenCalledTimes(1); 
    expect(appendMock.mock.calls[0][0].range).toBe("'Sheet1'!A1");
  });

  it('Existing headers plus one lead: next lead is written', async () => {
    const expectedHeaders = ['Lead ID', 'Submission ID', 'Received At', 'First Name', 'Last Name', 'Email', 'Business Name', 'Website', 'Main Challenge', 'Attribution Source', 'Attribution Medium', 'Attribution Campaign', 'Attribution Content', 'Attribution Term', 'Referrer', 'Landing Page', 'Intake Status', 'Booking Status', 'Call Prep Status', 'Follow-Up Status'];
    const row2 = ['id', 'sub1', 'time', 'John', 'Doe', 'john@a.com', '', '', 'chal', '', '', '', '', '', '', '', 'INTAKE_RECEIVED', 'PENDING', 'NOT_STARTED', 'NOT_STARTED'];
    getMock.mockImplementation(async (opts) => {
      if (opts.range.includes(':B')) {
        return { data: { values: [['test-lead-id', '550e8400-e29b-41d4-a716-446655440000']] } };
      }
      return { data: { values: [expectedHeaders, row2] } };
    });
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await handler(getValidReq(), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(appendMock).toHaveBeenCalledTimes(1);
  });

  it('Apostrophe-safe tab', async () => {
    process.env.GOOGLE_SHEET_TAB_NAME = "Daniel's Leads";
    const expectedHeaders = ['Lead ID', 'Submission ID', 'Received At', 'First Name', 'Last Name', 'Email', 'Business Name', 'Website', 'Main Challenge', 'Attribution Source', 'Attribution Medium', 'Attribution Campaign', 'Attribution Content', 'Attribution Term', 'Referrer', 'Landing Page', 'Intake Status', 'Booking Status', 'Call Prep Status', 'Follow-Up Status'];
    getMock.mockImplementation(async (opts) => {
      if (opts.range.includes(':B')) {
        return { data: { values: [['test-lead-id', '550e8400-e29b-41d4-a716-446655440000']] } };
      }
      return { data: { values: [expectedHeaders] } };
    });
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await handler(getValidReq(), res);
    expect(appendMock.mock.calls[0][0].range).toBe("'Daniel''s Leads'!A1");
  });

  it('Successful write returns ok: true only after append resolves', async () => {
    const expectedHeaders = ['Lead ID', 'Submission ID', 'Received At', 'First Name', 'Last Name', 'Email', 'Business Name', 'Website', 'Main Challenge', 'Attribution Source', 'Attribution Medium', 'Attribution Campaign', 'Attribution Content', 'Attribution Term', 'Referrer', 'Landing Page', 'Intake Status', 'Booking Status', 'Call Prep Status', 'Follow-Up Status'];
    getMock.mockImplementation(async (opts) => {
      if (opts.range.includes(':B')) {
        return { data: { values: [['test-lead-id', '550e8400-e29b-41d4-a716-446655440000']] } };
      }
      return { data: { values: [expectedHeaders] } };
    });
    let resolveAppend: any;
    const appendPromise = new Promise((resolve) => { resolveAppend = resolve; });
    appendMock.mockReturnValueOnce(appendPromise);
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const handlerPromise = handler(getValidReq(), res);
    
    expect(res.status).not.toHaveBeenCalled();
    
    resolveAppend({ data: { updates: { updatedRange: "'Sheet1'!A2:T2" } } });
    await handlerPromise;
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
  });

  it('Failed write returns safe 500 without success receipt', async () => {
    const expectedHeaders = ['Lead ID', 'Submission ID', 'Received At', 'First Name', 'Last Name', 'Email', 'Business Name', 'Website', 'Main Challenge', 'Attribution Source', 'Attribution Medium', 'Attribution Campaign', 'Attribution Content', 'Attribution Term', 'Referrer', 'Landing Page', 'Intake Status', 'Booking Status', 'Call Prep Status', 'Follow-Up Status'];
    getMock.mockImplementation(async (opts) => {
      if (opts.range.includes(':B')) {
        return { data: { values: [['test-lead-id', '550e8400-e29b-41d4-a716-446655440000']] } };
      }
      return { data: { values: [expectedHeaders] } };
    });
    appendMock.mockRejectedValueOnce(new Error('Google API Error!'));
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await handler(getValidReq(), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: false, error: expect.objectContaining({ code: 'INTERNAL_SERVER_ERROR' }) }));
    expect(res.json.mock.calls[0][0].error.message).not.toContain('Google API');
  });

  it('Duplicate Submission ID returns duplicate: true and original ID without appending', async () => {
    const expectedHeaders = ['Lead ID', 'Submission ID', 'Received At', 'First Name', 'Last Name', 'Email', 'Business Name', 'Website', 'Main Challenge', 'Attribution Source', 'Attribution Medium', 'Attribution Campaign', 'Attribution Content', 'Attribution Term', 'Referrer', 'Landing Page', 'Intake Status', 'Booking Status', 'Call Prep Status', 'Follow-Up Status'];
    const row2 = ['existing-lead-id', '550e8400-e29b-41d4-a716-446655440000', 'time', 'John', 'Doe', 'john@a.com', '', '', 'chal', '', '', '', '', '', '', '', 'INTAKE_RECEIVED', 'PENDING', 'NOT_STARTED', 'NOT_STARTED'];
    getMock.mockImplementation(async () => {
      return { data: { values: [expectedHeaders, row2] } };
    });
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await handler(getValidReq(), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ duplicate: true, leadId: 'existing-lead-id' }));
    expect(appendMock).not.toHaveBeenCalled();
  });
  
  it('Empty sheet idempotency writes exactly once', async () => {
    getMock.mockImplementation(async (opts) => {
      if (opts.range.includes(':B')) {
        return { data: { values: [['test-lead-id', '550e8400-e29b-41d4-a716-446655440000']] } };
      }
      return { data: { values: [] } };
    });
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await handler(getValidReq(), res);
    expect(appendMock).toHaveBeenCalledTimes(2); // Headers + Data
  });
});

describe('MicroIntake Form Client Lifecycle', () => {
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

  it('real honeypot field and no navigation', async () => {
    render(
      <MemoryRouter>
        <MicroIntakePage />
      </MemoryRouter>
    );
    const honeypot = document.getElementById('honeypot') as HTMLInputElement;
    expect(honeypot).toBeDefined();
    expect(honeypot.style.position).toBe('absolute');
    expect(honeypot.style.left).toBe('-9999px');
    expect(honeypot.getAttribute('aria-hidden')).toBe('true');
  });

  it('submission ID survives remount/refresh', async () => {
    const { unmount } = render(
      <MemoryRouter>
        <MicroIntakePage />
      </MemoryRouter>
    );
    const firstId = sessionStorage.getItem('sg_active_submission_id');
    expect(firstId).toBeDefined();
    expect(firstId?.length).toBeGreaterThan(10);

    unmount();

    render(
      <MemoryRouter>
        <MicroIntakePage />
      </MemoryRouter>
    );
    const secondId = sessionStorage.getItem('sg_active_submission_id');
    expect(secondId).toBe(firstId);
  });

  it('ID rotates only after confirmed success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ ok: true, leadId: 'test-lead-id' })
    }));

    render(
      <MemoryRouter>
        <MicroIntakePage />
      </MemoryRouter>
    );

    const firstId = sessionStorage.getItem('sg_active_submission_id');

    fireEvent.change(screen.getByLabelText(/Full Name \*/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Business Email \*/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Main Growth Challenge \*/i), { target: { value: 'Growth issue' } });

    fireEvent.click(screen.getByRole('button', { name: /See Available Times/i }));

    await waitFor(() => {
      expect(window.location.href).toContain('zcal.co');
    });

    const secondId = sessionStorage.getItem('sg_active_submission_id');
    expect(secondId).not.toBe(firstId);
  });
  
  it('Failed write prevents Zcal navigation', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ ok: false })
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

    // Wait some time to ensure navigation didn't happen
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(window.location.href).toBe('');
  });
});

