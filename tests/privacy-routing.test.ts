import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('durable privacy route', () => {
  it('serves a real static policy before the SPA fallback and keeps footer navigation', () => {
    const projectRoot = path.resolve(__dirname, '..');
    const policy = fs.readFileSync(path.join(projectRoot, 'public/privacy.html'), 'utf8');
    const vercel = JSON.parse(fs.readFileSync(path.join(projectRoot, 'vercel.json'), 'utf8'));
    const app = fs.readFileSync(path.join(projectRoot, 'src/App.tsx'), 'utf8');
    const privacyRewrite = vercel.rewrites.findIndex((entry: { source: string }) => entry.source === '/privacy');
    const spaFallback = vercel.rewrites.findIndex((entry: { source: string }) => entry.source === '/(.*)');

    expect(privacyRewrite).toBeGreaterThan(-1);
    expect(vercel.rewrites[privacyRewrite].destination).toBe('/privacy.html');
    expect(privacyRewrite).toBeLessThan(spaFallback);
    expect(policy).toContain('Strategic Growth — operated by Daniel Ortiz');
    expect(policy).toContain('strategicgrowth.biz@outlook.com');
    expect(policy).toContain('Meta Instant Form');
    expect(policy).toContain('does not currently operate an automated CRM pipeline');
    expect(app).toMatch(/<a href="\/privacy"[^>]*>Privacy Policy<\/a>/);
  });
});
