import { test, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

test('Lead submission does not serialize raw exception objects', () => {
  const submitFilePath = path.resolve(__dirname, '../api/leads/submit.ts');
  const content = fs.readFileSync(submitFilePath, 'utf8');
  
  // Ensure the specific raw error logging patterns are absent
  expect(content).not.toMatch(/console\.error\("Google Sheets API error",\s*err\)/);
  expect(content).not.toMatch(/console\.error\("Google Sheets API error",\s*[^)]+\)/);
});

test('Notification store does not serialize raw exception objects', () => {
  const storeFilePath = path.resolve(__dirname, '../api/leads/_notifications/store.ts');
  const content = fs.readFileSync(storeFilePath, 'utf8');
  
  // Ensure the specific raw error logging patterns are absent
  expect(content).not.toMatch(/console\.error\("Failed to write to Lead Events",\s*err\)/);
  expect(content).not.toMatch(/console\.error\("Failed to write to Lead Events",\s*[^)]+\)/);
});
