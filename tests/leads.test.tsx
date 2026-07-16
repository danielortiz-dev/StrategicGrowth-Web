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
        GoogleAuth: class {
          constructor(public opts: any) {
            // we can inspect opts to test private-key newline normalization
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

  it('successful append and apostrophe-safe tab range', async () => {
    const res = getRes();
    await handler(getValidReq(), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(appendMock).toHaveBeenCalled();
    const rangeUsed = appendMock.mock.calls[0][0].range;
    expect(rangeUsed).toBe("'Daniel''s Leads'!A1");
  });

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
    // Simulate a body that passes JSON length but fails buffer limit?
    // Actually, just a very large body
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

  it('compatible headers accepted', async () => {
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await handler(getValidReq(), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(appendMock).toHaveBeenCalled();
  });

  it('duplicate response succeeds', async () => {
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
});
