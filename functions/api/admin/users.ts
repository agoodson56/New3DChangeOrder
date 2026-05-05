/**
 * Admin user management endpoints.
 * GET /api/admin/users - list all users (admin only)
 * POST /api/admin/users - create user (admin only)
 * DELETE /api/admin/users/:id - delete user (admin only)
 * PATCH /api/admin/users/:id - update user (admin only)
 */

import { verifyToken } from '../../lib/jwt';
import { hashPassword } from '../../lib/password';

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

type PagesContext<EnvT, Params extends Record<string, string> = Record<string, string>> = {
  request: Request;
  env: EnvT;
  params: Params;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, no-store',
    },
  });

async function isAdmin(request: Request, secret: string): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  const token = authHeader.slice(7);
  const payload = await verifyToken(token, secret);
  return payload?.role === 'admin';
}

export const onRequestGet = async ({ request, env }: PagesContext<Env>): Promise<Response> => {
  if (!env.DB || !env.JWT_SECRET) return json({ error: 'Server not configured' }, 503);

  if (!(await isAdmin(request, env.JWT_SECRET))) {
    return json({ error: 'Unauthorized' }, 403);
  }

  try {
    const { results } = await env.DB
      .prepare('SELECT id, username, email, role, status, created_at FROM users ORDER BY created_at DESC')
      .all<{ id: number; username: string; email: string; role: string; status: string; created_at: number }>();

    return json({ users: results });
  } catch (error) {
    console.error('Get users error:', error);
    return json({ error: 'Failed to fetch users' }, 500);
  }
};

export const onRequestPost = async ({ request, env }: PagesContext<Env>): Promise<Response> => {
  if (!env.DB || !env.JWT_SECRET) return json({ error: 'Server not configured' }, 503);

  if (!(await isAdmin(request, env.JWT_SECRET))) {
    return json({ error: 'Unauthorized' }, 403);
  }

  try {
    const { username, email, password, role = 'user' } = await request.json() as {
      username?: string;
      email?: string;
      password?: string;
      role?: string;
    };

    if (!username || !email || !password) {
      return json({ error: 'Username, email, and password required' }, 400);
    }

    const existing = await env.DB
      .prepare('SELECT id FROM users WHERE username = ? OR email = ?')
      .bind(username, email)
      .first();

    if (existing) {
      return json({ error: 'Username or email already exists' }, 409);
    }

    const hashedPassword = await hashPassword(password);
    const now = Date.now();

    const result = await env.DB
      .prepare('INSERT INTO users (username, email, password, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(username, email, hashedPassword, role, 'active', now, now)
      .run();

    return json({ success: true, message: 'User created' }, 201);
  } catch (error) {
    console.error('Create user error:', error);
    return json({ error: 'Failed to create user' }, 500);
  }
};

export const onRequestDelete = async ({ request, env, params }: PagesContext<Env, { id?: string }>): Promise<Response> => {
  if (!env.DB || !env.JWT_SECRET) return json({ error: 'Server not configured' }, 503);

  if (!(await isAdmin(request, env.JWT_SECRET))) {
    return json({ error: 'Unauthorized' }, 403);
  }

  try {
    const userId = parseInt(params.id || '0', 10);
    if (!userId) return json({ error: 'Invalid user ID' }, 400);

    const result = await env.DB
      .prepare('DELETE FROM users WHERE id = ?')
      .bind(userId)
      .run();

    return json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    return json({ error: 'Failed to delete user' }, 500);
  }
};

export const onRequestPatch = async ({ request, env, params }: PagesContext<Env, { id?: string }>): Promise<Response> => {
  if (!env.DB || !env.JWT_SECRET) return json({ error: 'Server not configured' }, 503);

  if (!(await isAdmin(request, env.JWT_SECRET))) {
    return json({ error: 'Unauthorized' }, 403);
  }

  try {
    const userId = parseInt(params.id || '0', 10);
    if (!userId) return json({ error: 'Invalid user ID' }, 400);

    const { status, role, password } = await request.json() as {
      status?: string;
      role?: string;
      password?: string;
    };

    if (password) {
      const hashedPassword = await hashPassword(password);
      await env.DB
        .prepare('UPDATE users SET password = ?, updated_at = ? WHERE id = ?')
        .bind(hashedPassword, Date.now(), userId)
        .run();
    }

    if (status) {
      await env.DB
        .prepare('UPDATE users SET status = ?, updated_at = ? WHERE id = ?')
        .bind(status, Date.now(), userId)
        .run();
    }

    if (role) {
      await env.DB
        .prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?')
        .bind(role, Date.now(), userId)
        .run();
    }

    return json({ success: true, message: 'User updated' });
  } catch (error) {
    console.error('Update user error:', error);
    return json({ error: 'Failed to update user' }, 500);
  }
};
