/**
 * POST /api/auth/register
 * Register a new user (registration must be enabled by admin).
 */

import { hashPassword } from '../../lib/password';
import { createToken } from '../../lib/jwt';

interface Env {
  DB?: D1Database;
  JWT_SECRET?: string;
  REGISTRATION_ENABLED?: string;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
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

  if (env.REGISTRATION_ENABLED !== 'true') {
    return json({ error: 'Registration is disabled' }, 403);
  }

  try {
    const { username, email, password, confirmPassword } = await request.json() as {
      username?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    };

    if (!username || !email || !password || !confirmPassword) {
      return json({ error: 'All fields required' }, 400);
    }

    if (password !== confirmPassword) {
      return json({ error: 'Passwords do not match' }, 400);
    }

    if (password.length < 8) {
      return json({ error: 'Password must be at least 8 characters' }, 400);
    }

    if (!email.includes('@')) {
      return json({ error: 'Invalid email address' }, 400);
    }

    if (username.length < 3) {
      return json({ error: 'Username must be at least 3 characters' }, 400);
    }

    const existing = await env.DB
      .prepare('SELECT id FROM users WHERE username = ? OR email = ?')
      .bind(username, email)
      .first<{ id: number }>();

    if (existing) {
      return json({ error: 'Username or email already exists' }, 409);
    }

    const hashedPassword = await hashPassword(password);
    const now = Date.now();

    await env.DB
      .prepare('INSERT INTO users (username, email, password, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(username, email, hashedPassword, 'user', 'active', now, now)
      .run();

    const user = await env.DB
      .prepare('SELECT id, username, email, role FROM users WHERE username = ?')
      .bind(username)
      .first<{ id: number; username: string; email: string; role: string }>();

    if (!user) {
      return json({ error: 'Registration failed' }, 500);
    }

    const token = await createToken({ userId: user.id, username: user.username, email: user.email, role: user.role }, env.JWT_SECRET);

    return json(
      {
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      201
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Registration error:', message);
    return json({ error: 'Registration failed' }, 500);
  }
};
