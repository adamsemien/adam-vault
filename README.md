# Adam Vault

A personal secrets management API built with Next.js 14, TypeScript, Supabase, and Vercel.

## Phase 1: Scaffolding & Database Schema - COMPLETE ✅

### What's Included

**Core Features:**
- Next.js 14 App Router with TypeScript
- Tailwind CSS for UI
- Supabase integration for database & auth
- AES-256-GCM encryption for secrets
- Project tokens for API access
- Audit logging
- Secret rotation tracking

**File Structure:**
```
adam-vault/
├── app/
│   ├── api/
│   │   ├── auth/login/route.ts
│   │   ├── health/route.ts
│   │   ├── secrets/route.ts
│   │   ├── secrets/[id]/route.ts
│   │   ├── secrets/[id]/rotate/route.ts
│   │   ├── tokens/route.ts
│   │   └── tokens/[id]/route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/page.tsx
│   └── vault/page.tsx
├── lib/
│   ├── supabase.ts (Supabase server client)
│   └── crypto.ts (AES-256-GCM encryption)
├── middleware.ts (Protected route handling)
├── types/index.ts (TypeScript interfaces)
├── DATABASE_SCHEMA.sql (Ready to paste into Supabase)
└── .env.local (Configured with Supabase credentials)
```

**Database Tables:**
- `secrets`: Encrypted secret storage with rotation tracking
- `project_tokens`: API token management
- `audit_log`: Access and modification tracking

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://scpffyuodwbvmxbbzvnu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
VAULT_ENCRYPTION_KEY=a0b512c077101c2f6657437beb67fc68c0d94030580303ce88acee203de5a8c1
```

### VAULT_ENCRYPTION_KEY (Generated)

**⚠️ KEEP THIS SAFE - DO NOT SHARE:**
```
a0b512c077101c2f6657437beb67fc68c0d94030580303ce88acee203de5a8c1
```

This is a 32-byte AES-256 key in hex format. Store it securely in:
1. `.env.local` (already added)
2. Vercel deployment secrets
3. Backup secure location

### Next Steps

1. **Create GitHub Repository**: `adamsemien/adam-vault`
2. **Deploy Database Schema**: Copy `DATABASE_SCHEMA.sql` into Supabase SQL editor
3. **Deploy to Vercel**: Connect GitHub repo and deploy

### Local Development

```bash
# Install dependencies (already done)
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

Visit `http://localhost:3000` to see the app.

### API Endpoints

**Health Check:**
- `GET /api/health` - Server status

**Secrets:**
- `GET /api/secrets` - List all secrets
- `POST /api/secrets` - Create secret
- `GET /api/secrets/:id` - Get secret (with decryption)
- `DELETE /api/secrets/:id` - Delete secret
- `POST /api/secrets/:id/rotate` - Rotate secret

**Tokens:**
- `GET /api/tokens` - List tokens
- `POST /api/tokens` - Create token
- `DELETE /api/tokens/:id` - Revoke token

**Auth:**
- `POST /api/auth/login` - Login

### Security Features

✅ AES-256-GCM encryption for all secrets
✅ Secure token generation and hashing
✅ Audit logging for all operations
✅ Secret rotation with previous value tracking
✅ Protected API routes with middleware
✅ Service role key for backend operations

### Phase 1 Checkpoint

- ✅ GitHub repo scaffolded locally
- ✅ Next.js 14 initialized with TypeScript & Tailwind
- ✅ All required files created
- ✅ Database schema ready (DATABASE_SCHEMA.sql)
- ✅ Environment configured with credentials
- ✅ VAULT_ENCRYPTION_KEY generated: `a0b512c077101c2f6657437beb67fc68c0d94030580303ce88acee203de5a8c1`

**READY FOR PHASE 2:** Confirm database schema deployment and proceed with authentication & API implementation.
