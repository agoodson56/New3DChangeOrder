# Authentication System Setup

This app now uses custom app-level authentication instead of Cloudflare Access. All users log in with a username/email and password directly in the app.

## Environment Variables

Set these in **Cloudflare Pages → Settings → Environment variables**:

| Variable | Value | Description |
|----------|-------|-------------|
| `JWT_SECRET` | (Generate a random string) | Secret key for signing JWT tokens. Generate with: `openssl rand -hex 32` |
| `REGISTRATION_ENABLED` | `true` or `false` | Allow new users to register themselves (true) or admin-only registration (false) |

## Setup Steps

### 1. Generate JWT Secret

Generate a secure random string:
```bash
openssl rand -hex 32
```

Or use: https://generate-random.org/

Copy the result.

### 2. Set Environment Variables in Cloudflare

1. Go to **Cloudflare Dashboard** → **Pages** → Your Project → **Settings**
2. Scroll to **Environment variables**
3. Add these variables:
   - `JWT_SECRET`: Paste the generated secret from step 1
   - `REGISTRATION_ENABLED`: Set to `true` if you want users to self-register, or `false` for admin-only registration

### 3. Create Initial Admin User

1. Deploy the app to Cloudflare Pages
2. Once deployed, visit: `https://your-domain/api/auth/init-admin` as a POST request

**Using curl:**
```bash
curl -X POST https://your-domain/api/auth/init-admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "you@example.com",
    "password": "your-secure-password"
  }'
```

You'll get back a JWT token and user info. The first user created becomes the admin.

### 4. Log In

Visit your app URL and log in with the credentials you just created.

## User Management (Admin Only)

As an admin, you can manage users via the API:

### List All Users
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://your-domain/api/admin/users
```

### Create a New User
```bash
curl -X POST https://your-domain/api/admin/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "secure-password",
    "role": "user"
  }'
```

### Reset User Password
```bash
curl -X PATCH https://your-domain/api/admin/users/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password": "new-password"}'
```

### Disable User Account
```bash
curl -X PATCH https://your-domain/api/admin/users/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "inactive"}'
```

### Delete User
```bash
curl -X DELETE https://your-domain/api/admin/users/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Migration

If you haven't already, run the auth migration:

```bash
wrangler d1 execute new3dchangeorder --file=./db/migrations/002_add_auth_users.sql
```

This creates the `users` table and updates the `blobs` table with the `user_id` foreign key.

## Disabling Cloudflare Access

If you previously had Cloudflare Access configured, you can now remove it:

1. Go to **Cloudflare Zero Trust** → **Access** → **Applications**
2. Find the application for `/api/data*`
3. Delete it

The app no longer relies on Cloudflare Access for authentication.

## Per-User Data Isolation

Each user's change orders are now isolated:
- Users can only see and modify their own change orders
- Admins can access all user data
- Draft change orders are stored with the user's ID in the database

## Security Notes

- Passwords are hashed using PBKDF2 with SHA-256 and a random salt
- JWT tokens expire after 24 hours
- Tokens are stored in localStorage on the client (not httpOnly for SPA compatibility)
- Never commit `JWT_SECRET` to version control
- Use a strong, unique password for the admin account
