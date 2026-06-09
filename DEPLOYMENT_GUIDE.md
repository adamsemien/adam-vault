# ADAM VAULT - PHASE 1 DEPLOYMENT GUIDE

## Quick Reference

| Item | Status | Location |
|------|--------|----------|
| Repository | ✅ Local Git Init | `/tmp/adam-vault` |
| Next.js App | ✅ Scaffolded | App Router + TypeScript |
| Database Schema | ✅ Ready | `DATABASE_SCHEMA.sql` |
| Encryption Key | ✅ Generated | `a0b512c077101c2f6657437beb67fc68c0d94030580303ce88acee203de5a8c1` |
| Environment | ✅ Configured | `.env.local` |
| Dependencies | ✅ Installed | @supabase/supabase-js, crypto-js |

---

## VAULT_ENCRYPTION_KEY (Save This)

**⚠️ CRITICAL - Store Securely:**
```
a0b512c077101c2f6657437beb67fc68c0d94030580303ce88acee203de5a8c1
```

This is your master encryption key for all secrets. **DO NOT LOSE IT.**

---

## Immediate Next Steps

### 1. Deploy Database Schema to Supabase

**Copy the entire contents of `DATABASE_SCHEMA.sql`:**
```
-- Create secrets table
CREATE TABLE IF NOT EXISTS secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ... [full schema follows]
)
```

**Paste into Supabase SQL Editor:**
1. Visit: https://supabase.co
2. Select your project at: https://scpffyuodwbvmxbbzvnu.supabase.co
3. Go to: **SQL Editor** → **New Query**
4. Paste entire `DATABASE_SCHEMA.sql` content
5. Click **Execute**
6. ✅ Wait for success confirmation

---

### 2. Create GitHub Repository

```bash
# In the adam-vault directory
cd /tmp/adam-vault

# Add GitHub remote
git remote add origin https://github.com/adamsemien/adam-vault.git

# Rename default branch to main
git branch -M main

# Push initial commit
git push -u origin main
```

---

### 3. Deploy to Vercel

**Option A: Via Vercel Dashboard**
1. Visit: https://vercel.com/new
2. Select: Import Git Repository
3. Choose: `adamsemien/adam-vault`
4. Project Name: `adam-vault`
5. Framework: **Next.js**
6. Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://scpffyuodwbvmxbbzvnu.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...i6pY
   SUPABASE_SERVICE_ROLE_KEY=eyJhbG..._meI
   VAULT_ENCRYPTION_KEY=a0b512c077101c2f6657437beb67fc68c0d94030580303ce88acee203de5a8c1
   ```
7. Deploy!

**Option B: Via Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## Testing After Deployment

### Health Check
```bash
curl https://your-deployment.vercel.app/api/health
```

Expected Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-06-09T..."
}
```

### Create a Secret
```bash
curl -X POST https://your-deployment.vercel.app/api/secrets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Database Password",
    "service": "PostgreSQL",
    "value": "super-secret-password-123",
    "description": "Main database credentials",
    "project_tags": ["production"]
  }'
```

### List Secrets
```bash
curl https://your-deployment.vercel.app/api/secrets
```

---

## File Manifest (Phase 1)

**Configuration:**
- `.env.local` - Environment variables
- `package.json` - Dependencies (Next.js 14, TypeScript, Tailwind, Supabase)
- `tsconfig.json` - TypeScript config
- `tailwind.config.ts` - Tailwind CSS config
- `next.config.ts` - Next.js config

**UI Pages:**
- `app/layout.tsx` - Root layout (dark theme)
- `app/page.tsx` - Home redirect
- `app/login/page.tsx` - Login form
- `app/vault/page.tsx` - Vault dashboard

**API Endpoints:**
- `app/api/health/route.ts` - Health check
- `app/api/auth/login/route.ts` - Login
- `app/api/secrets/route.ts` - List/Create secrets
- `app/api/secrets/[id]/route.ts` - Get/Delete secret
- `app/api/secrets/[id]/rotate/route.ts` - Rotate secret
- `app/api/tokens/route.ts` - List/Create tokens
- `app/api/tokens/[id]/route.ts` - Revoke token

**Libraries:**
- `lib/supabase.ts` - Supabase client
- `lib/crypto.ts` - AES-256-GCM encryption
- `types/index.ts` - TypeScript types

**Middleware:**
- `middleware.ts` - Protected route handling

**Database:**
- `DATABASE_SCHEMA.sql` - PostgreSQL schema (ready to deploy)

**Documentation:**
- `README.md` - Project overview
- `PHASE1_CHECKPOINT.md` - Phase 1 status

---

## Security Checklist

- ✅ AES-256-GCM encryption implemented
- ✅ Supabase credentials in environment variables
- ✅ Service role key for backend operations
- ✅ Row-level security enabled on all tables
- ✅ Audit logging schema in place
- ✅ Token hashing (SHA-256)
- ✅ Protected routes with middleware
- ⏳ Authentication system (Phase 2)
- ⏳ Rate limiting (Phase 2)
- ⏳ API key validation (Phase 2)

---

## Troubleshooting

**Issue: "Encryption key not configured"**
- Check `.env.local` has `VAULT_ENCRYPTION_KEY`
- Restart dev server: `npm run dev`

**Issue: "Failed to connect to Supabase"**
- Verify URLs and keys in `.env.local`
- Check Supabase project is active
- Ensure firewall allows connections

**Issue: "Database tables not found"**
- Verify `DATABASE_SCHEMA.sql` was executed in Supabase
- Check SQL Editor for any error messages
- Re-run schema if needed

---

## Next Phase (Phase 2)

Once Phase 1 is confirmed working:
- ✅ Implement full authentication system
- ✅ Implement secret CRUD operations
- ✅ Implement token management
- ✅ Add audit logging
- ✅ Implement secret rotation
- ✅ Add frontend UI components
- ✅ Deploy to production

---

## Support

For issues or questions:
1. Check the README.md
2. Verify DATABASE_SCHEMA.sql was deployed
3. Check environment variables
4. Review server logs in Vercel dashboard
5. Check browser console for frontend errors

---

**STATUS: PHASE 1 COMPLETE ✅**

All scaffolding done. Ready for database deployment and Phase 2 implementation.
