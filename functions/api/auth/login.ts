/**
 * POST /api/auth/login
 * Authenticate user with username/email and password.
 * Returns JWT token on success.
 */

import { hashPassword, verifyPassword } from '../../lib/password';
import { createToken } from '../../lib/jwt';

interface Env {
  DB?: D1Database;
  JWT_SECRET?: string;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[] }>;
  run(): Promise<{ success: boolean }>;
}

type PagesContext<EnvT> = { request: Request; env: EnvT };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, no-store',
    },
  });

export const onRequestPost = async ({ request, env }: PagesContext<Env>): Promise<Response> => {
  if (!env.DB) return json({ error: 'Database not configured' }, 503);
  if (!env.JWT_SECRET) return json({ error: 'JWT secret not configured' }, 500);

  try {
    const { username, password } = await request.json() as { username?: string; password?: string };

    if (!username || !password) {
      return json({ error: 'Username and password required' }, 400);
    }

    const user = await env.DB
      .prepare('SELECT id, username, email, password, role, status FROM users WHERE username = ? OR email = ?')
      .bind(username, username)
      .first<{ id: number; username: string; email: string; password: string; role: string; status: string }>();

    if (!user) {
      return json({ error: 'Invalid username or password' }, 401);
    }

    if (user.status !== 'active') {
      return json({ error: 'Account is disabled' }, 403);
    }

    const passwordValid = await verifyPassword(password, user.password);
    if (!passwordValid) {
      return json({ error: 'Invalid username or password' }, 401);
    }

    const token = await createToken({ userId: user.id, username: user.username, email: user.email, role: user.role }, env.JWT_SECRET);

    return json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Login error:', message);
    return json({ error: 'Login failed' }, 500);
  }
};
