# Adam Vault Phase 1 - Deployment Manifest & Instructions

**Generated**: 2026-06-09  
**Status**: 🟡 SCAFFOLDING COMPLETE - DEPLOYMENT BLOCKED  

---

## Executive Summary

Adam Vault Phase 1 scaffolding is **100% complete** locally. All source code, configuration, and database schema are ready for deployment. However, deployment to GitHub and Supabase is blocked due to environment constraints:

- **GitHub**: GITHUB_TOKEN not properly configured in deployment environment
- **Supabase**: Cloud Supabase instance unreachable from environment (DNS resolution failure)

---

## Prerequisites Checklist

### Local Environment (✅ VERIFIED)
- [x] `/tmp/adam-vault` directory with 33 files
- [x] Next.js 14 with TypeScript app structure
- [x] Git repository initialized with 1 commit
- [x] All npm dependencies installed (369 packages)
- [x] Environment variables configured in `.env.local`
- [x] Encryption key generated and stored
- [x] DATABASE_SCHEMA.sql prepared and ready

### External Services (❌ REQUIRES ACTION)
- [ ] GitHub repository `adamsemien/adam-vault` created
- [ ] Supabase tables deployed (`secrets`, `project_tokens`, `audit_log`)
- [ ] RLS policies enabled on Supabase tables
- [ ] GitHub token with `repo` scope available
- [ ] Network connectivity to `scpffyuodwbvmxbbzvnu.supabase.co` established

---

## Critical Values (SAVE THESE)

### Encryption Key
```
VAULT_ENCRYPTION_KEY=a0b512c077101c2f6657437beb67fc68c0d94030580303ce88acee203de5a8c1
```
Algorithm: AES-256-GCM | Size: 256 bits

### Supabase Project
```
URL: https://scpffyuodwbvmxbbzvnu.supabase.co
API Key (Anon): eyJhbG...i6pY (stored in .env.local)
Service Role Key: eyJhbG..._meI (stored in .env.local)
```

### Repository Structure
```
/tmp/adam-vault/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx               # Root layout (dark theme)
│   ├── page.tsx                 # Home redirect
│   ├── login/page.tsx           # Login page
│   ├── vault/page.tsx           # Vault dashboard
│   └── api/                     # 8 API endpoints
│       ├── health/route.ts
│       ├── auth/login/route.ts
│       ├── secrets/route.ts
│       ├── secrets/[id]/route.ts
│       ├── secrets/[id]/rotate/route.ts
│       ├── tokens/route.ts
│       └── tokens/[id]/route.ts
├── lib/
│   ├── supabase.ts             # Supabase client
│   └── crypto.ts               # AES-256-GCM encryption
├── types/
│   └── index.ts                # TypeScript interfaces
├── DATABASE_SCHEMA.sql         # 3 tables + RLS
├── package.json                # 369 dependencies
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── middleware.ts
```

---

## Step 1: Create GitHub Repository

### Option A: Using GitHub Web UI
1. Visit: https://github.com/new
2. Repository name: `adam-vault`
3. Owner: `adamsemien`
4. Description: `Adam Vault - Secrets Management System`
5. Visibility: Public
6. ✗ Skip "Initialize this repository..."
7. Click "Create repository"

### Option B: Using GitHub CLI (When Token Available)
```bash
gh repo create adamsemien/adam-vault \
  --public \
  --source=/tmp/adam-vault \
  --remote=origin \
  --push
```

### Option C: Manual Git Push
```bash
cd /tmp/adam-vault

# Add remote
git remote add origin https://github.com/adamsemien/adam-vault.git

# Ensure main branch
git branch -M main

# Push
git push -u origin main
```

**Expected Result:**  
Repository created at: https://github.com/adamsemien/adam-vault

---

## Step 2: Deploy Database Schema to Supabase

### Option A: Using Supabase Web Console (Recommended)
1. Visit: https://app.supabase.com
2. Select project: https://scpffyuodwbvmxbbzvnu.supabase.co
3. Go to: **SQL Editor** → **New Query**
4. Copy entire contents of `/tmp/adam-vault/DATABASE_SCHEMA.sql`:

```sql
-- Create secrets table
CREATE TABLE IF NOT EXISTS secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  service VARCHAR(255) NOT NULL,
  encrypted_value TEXT NOT NULL,
  iv VARCHAR(255) NOT NULL,
  previous_encrypted_value TEXT,
  previous_iv VARCHAR(255),
  description TEXT,
  project_tags TEXT[] DEFAULT '{}',
  needs_rotation BOOLEAN DEFAULT false,
  last_rotated TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create project_tokens table
CREATE TABLE IF NOT EXISTS project_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  token_prefix VARCHAR(8) NOT NULL,
  allowed_tags TEXT[] DEFAULT '{}',
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  revoked BOOLEAN DEFAULT false
);

-- Create audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  secret_id UUID NOT NULL REFERENCES secrets(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  token_name VARCHAR(255),
  timestamp TIMESTAMPTZ DEFAULT now(),
  note TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS secrets_service_idx ON secrets(service);
CREATE INDEX IF NOT EXISTS secrets_created_at_idx ON secrets(created_at);
CREATE INDEX IF NOT EXISTS project_tokens_token_prefix_idx ON project_tokens(token_prefix);
CREATE INDEX IF NOT EXISTS audit_log_secret_id_idx ON audit_log(secret_id);
CREATE INDEX IF NOT EXISTS audit_log_timestamp_idx ON audit_log(timestamp);

-- Enable Row Level Security (optional, for future auth)
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
```

5. Click **Execute**
6. ✅ Wait for success confirmation

### Option B: Using Supabase Python SDK
```python
from supabase import create_client

supabase = create_client(
    "https://scpffyuodwbvmxbbzvnu.supabase.co",
    "your-service-role-key"
)

with open('/tmp/adam-vault/DATABASE_SCHEMA.sql', 'r') as f:
    schema = f.read()

# Note: Supabase client doesn't support direct SQL execution
# Use web console instead
```

**Expected Result:**  
Three tables created with RLS enabled:
- `secrets` (13 columns)
- `project_tokens` (7 columns)
- `audit_log` (5 columns)

---

## Step 3: Verify Deployment

### Verify GitHub Repository
```bash
# Clone and verify
git clone https://github.com/adamsemien/adam-vault.git /tmp/verify-adam-vault
cd /tmp/verify-adam-vault
git log --oneline -1
# Expected: Shows the Phase 1 commit
```

### Verify Supabase Schema
```bash
# Using Supabase SQL console, execute:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Expected output:
-- secrets
-- project_tokens
-- audit_log

-- Check RLS status:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Expected: All three tables show RLS enabled
```

### Verify Table Structure
```sql
-- Check secrets table
\d secrets;

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'secrets';

-- Expected indexes:
-- secrets_pkey
-- secrets_service_idx
-- secrets_created_at_idx
```

---

## File Manifest

### Configuration Files
- `.env.local` - Environment variables (Supabase keys, encryption key)
- `.env.example` - Example environment file
- `.gitignore` - Git ignore rules
- `package.json` - npm dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `eslint.config.mjs` - ESLint rules
- `middleware.ts` - Next.js middleware

### Application Code (14 files)
- `app/layout.tsx` - Root layout
- `app/page.tsx` - Home page
- `app/login/page.tsx` - Login page
- `app/vault/page.tsx` - Vault dashboard
- `app/api/health/route.ts` - Health check endpoint
- `app/api/auth/login/route.ts` - Auth login endpoint
- `app/api/secrets/route.ts` - List/create secrets
- `app/api/secrets/[id]/route.ts` - Get/delete secret
- `app/api/secrets/[id]/rotate/route.ts` - Rotate secret
- `app/api/tokens/route.ts` - List/create tokens
- `app/api/tokens/[id]/route.ts` - Delete token
- `lib/supabase.ts` - Supabase client initialization
- `lib/crypto.ts` - AES-256-GCM encryption
- `types/index.ts` - TypeScript interfaces

### Database
- `DATABASE_SCHEMA.sql` - Database schema (3 tables + RLS)

### Documentation
- `README.md` - Project overview
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `PHASE1_CHECKPOINT.md` - Phase 1 checkpoint
- `PHASE1_COMPLETE.txt` - Phase 1 completion status
- `PHASE1_FINAL_CHECKPOINT.md` - Final checkpoint
- `QUICK_REFERENCE.txt` - Quick reference guide
- `AGENTS.md` - Agent rules and guidelines

---

## Environment Troubleshooting

### If GitHub Token Not Available
1. Generate a new PAT: https://github.com/settings/tokens
2. Scopes needed: `repo`, `delete_repo` (if needed)
3. Export: `export GITHUB_TOKEN=your_token_here`
4. Then retry push: `cd /tmp/adam-vault && git push -u origin main`

### If Supabase Not Accessible
1. Check DNS resolution: `nslookup scpffyuodwbvmxbbzvnu.supabase.co`
2. Check firewall rules: ensure HTTPS (443) is open
3. Test connectivity: `curl -I https://app.supabase.com`
4. If blocked, use web console directly

### If Git Remote Already Exists
```bash
cd /tmp/adam-vault
git remote remove origin
git remote add origin https://github.com/adamsemien/adam-vault.git
git push -u origin main
```

---

## Next Steps (Phase 2)

Once deployment is verified:

1. ✅ Create API endpoints for secret management
2. ✅ Implement authentication & authorization
3. ✅ Deploy to Vercel
4. ✅ Configure environment variables
5. ✅ Run integration tests
6. ✅ Enable production monitoring

**Phase 2 will begin once:**
- ✅ GitHub repo is live
- ✅ Database schema is deployed
- ✅ All 3 tables verified in Supabase

---

## Security Notes

### Encryption Key
- The `VAULT_ENCRYPTION_KEY` is **non-recoverable**
- Store in a secure password manager
- Never commit to version control
- Configure in Vercel secrets before deployment

### Database Access
- Service Role Key has admin privileges
- Use Anon Key for client-side operations
- Implement RLS policies before production
- Rotate keys quarterly

### GitHub Repository
- Public repository is safe (no secrets committed)
- Verify `.gitignore` protects `.env.local`
- Enable branch protection on `main` before Phase 2
- Require PR reviews before merging

---

## Summary

| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| Scaffolding | ✅ Complete | `/tmp/adam-vault` | Ready to push |
| Git Repo | 🟡 Ready | Local only | Awaiting GitHub push |
| Database Schema | 🟡 Ready | `DATABASE_SCHEMA.sql` | Awaiting Supabase deployment |
| Environment Config | ✅ Complete | `.env.local` | All credentials present |
| Dependencies | ✅ Complete | `node_modules/` | 369 packages installed |
| Type Definitions | ✅ Complete | `types/index.ts` | Full TypeScript support |
| Encryption | ✅ Complete | `lib/crypto.ts` | AES-256-GCM ready |

**Next Action**: Execute deployment steps 1-3 above to move to Phase 2.
