/**
 * POST /api/auth/init-admin
 * One-time endpoint to create the initial admin user.
 * Can only be called if no users exist in the database.
 * After the first admin is created, this endpoint returns 403.
 */

import { hashPassword } from '../../lib/password';
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
  if (!env.DB || !env.JWT_SECRET) return json({ error: 'Server not configured' }, 503);

  try {
    // Check if any users already exist
    const existingUser = await env.DB
      .prepare('SELECT id FROM users LIMIT 1')
      .first<{ id: number }>();

    if (existingUser) {
      return json({ error: 'Admin user already exists. This endpoint can only be used once.' }, 403);
    }

    const { username, email, password } = await request.json() as {
      username?: string;
      email?: string;
      password?: string;
    };

    if (!username || !email || !password) {
      return json({ error: 'Username, email, and password required' }, 400);
    }

    if (password.length < 8) {
      return json({ error: 'Password must be at least 8 characters' }, 400);
    }

    if (!email.includes('@')) {
      return json({ error: 'Invalid email address' }, 400);
    }

    const hashedPassword = await hashPassword(password);
    const now = Date.now();

    await env.DB
      .prepare('INSERT INTO users (username, email, password, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(username, email, hashedPassword, 'admin', 'active', now, now)
      .run();

    const user = await env.DB
      .prepare('SELECT id, username, email, role FROM users WHERE username = ?')
      .bind(username)
      .first<{ id: number; username: string; email: string; role: string }>();

    if (!user) {
      return json({ error: 'Failed to create admin user' }, 500);
    }

    const token = await createToken({ userId: user.id, username: user.username, email: user.email, role: user.role }, env.JWT_SECRET);

    return json(
      {
        success: true,
        message: 'Admin user created successfully',
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
    console.error('Init admin error:', message);
    return json({ error: 'Failed to create admin user' }, 500);
  }
};
