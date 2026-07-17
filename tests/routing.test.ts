import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Vercel Routing Configuration', () => {
  it('should have a vercel.json that supports SPA routing without breaking API routes', () => {
    const configPath = path.resolve(__dirname, '../vercel.json');
    expect(fs.existsSync(configPath)).toBe(true);

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    expect(config.rewrites).toBeDefined();

    const apiRewrite = config.rewrites.find((r: any) => r.source === '/api/(.*)');
    expect(apiRewrite).toBeDefined();
    expect(apiRewrite.destination).toBe('/api/$1');

    const spaRewrite = config.rewrites.find((r: any) => r.source === '/(.*)');
    expect(spaRewrite).toBeDefined();
    expect(spaRewrite.destination).toBe('/index.html');
  });
});
