import { test, expect, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ signUp: vi.fn(), signInWithPassword: vi.fn(), signOut: vi.fn() }));
vi.mock('../src/scripts/services/supabase.js', () => ({ getSupabase: () => ({ auth: mocks }) }));
import { signUp, signInWithPassword, signOut, isAuthenticated } from '../src/scripts/services/auth.js';

test('signup requires a session before marking the user authenticated', async () => {
  mocks.signUp.mockResolvedValue({ data: { user: { id: 'new' }, session: null }, error: null });
  await signUp('test@example.com', 'password');
  expect(isAuthenticated()).toBe(false);
  mocks.signUp.mockResolvedValue({ data: { user: { id: 'new' }, session: { user: { id: 'new' } } }, error: null });
  await signUp('test@example.com', 'password');
  expect(isAuthenticated()).toBe(true);
});

test('failed signout keeps the session and reports the error', async () => {
  mocks.signInWithPassword.mockResolvedValue({ data: { session: { user: { id: 'u' } } }, error: null });
  await signInWithPassword('test@example.com', 'password');
  mocks.signOut.mockResolvedValue({ error: new Error('signout failed') });
  await expect(signOut()).rejects.toThrow('signout failed');
  expect(isAuthenticated()).toBe(true);
  mocks.signOut.mockResolvedValue({ error: null });
  await signOut();
  expect(isAuthenticated()).toBe(false);
});
