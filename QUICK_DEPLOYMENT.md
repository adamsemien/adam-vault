# ADAM VAULT - QUICK DEPLOYMENT CHECKLIST

## PRE-DEPLOYMENT VERIFICATION

✅ Repository: https://github.com/adamsemien/adam-vault
✅ Build Status: Successful (tested locally)
✅ Code: Pushed to main branch
✅ Production Ready: YES

## VERCEL DEPLOYMENT - 5 MINUTE SETUP

### Step 1: Create Project
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Search for "adam-vault"
4. Click to import the repository
5. Vercel auto-detects framework (Next.js)

### Step 2: Configure Environment Variables
In Vercel Settings > Environment Variables, add:

Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://pjvotatddpzptriueidb.supabase.co
Scope: Production

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqdm90YXRkZHB6cHRyaXVlaWRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5Nzg2NzUsImV4cCI6MjA5NjU1NDY3NX0.JPUKF0iBiDBhqy0uUNVhziU6oIGudZYEPGnTgCLQ_Ac
Scope: Production

Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqdm90YXRkZHB6cHRyaXVlaWRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDk3ODY3NSwiZXhwIjoyMDk2NTU0Njc1fQ.8PpRk0-0TWel46wFctX8Pkx4PRHhmjldWVAT1FIWg2Q
Scope: Production

Name: VAULT_ENCRYPTION_KEY
Value: a0b512c077101c2f6657437beb67fc68c0d94030580303ce88acee203de5a8c1
Scope: Production

Name: NEXT_PUBLIC_ALLOWED_EMAIL
Value: adamsemien@gmail.com
Scope: Production

### Step 3: Deploy
Click "Deploy" button
Wait for build to complete (typically 2-3 minutes)

### Step 4: Verify
After deployment:
1. Note your URL (https://adam-vault-XXXX.vercel.app)
2. Test health: curl {url}/api/health
3. Test auth guard: curl {url}/api/secrets

## TESTING CHECKLIST

After deployment, run these 14 tests:

IMMEDIATE TESTS (No Auth):
1. [ ] GET /api/health -> 200 with status: ok
2. [ ] GET /api/secrets (no token) -> 401
3. [ ] GET / -> 307 redirect to /login

AUTHENTICATION TESTS (Via Browser):
4. [ ] Login with adamsemien@gmail.com (magic link)
5. [ ] Dashboard loads successfully
6. [ ] Create secret TEST_KEY=hello123
7. [ ] Secret appears in table
8. [ ] Can view secret details

API TOKEN TESTS:
9. [ ] Generate project token
10. [ ] Token is in format avt_...
11. [ ] Copy token works

OPERATIONS TESTS:
12. [ ] List secrets with API token
13. [ ] Rotate secret value
14. [ ] Audit log shows rotation

CLEANUP TESTS:
15. [ ] Revoke token
16. [ ] Revoked token returns 401
17. [ ] Delete secret
18. [ ] Audit log shows deletion
19. [ ] Final health check -> key_count: 0

## TROUBLESHOOTING

### Build Fails
- Check all 5 environment variables are set
- Verify values don't have extra whitespace
- Check GitHub access token is still valid

### Auth Fails
- Ensure NEXT_PUBLIC_ALLOWED_EMAIL is: adamsemien@gmail.com
- Check Supabase project is active
- Verify magic link email receives properly

### API Returns 401
- Verify session cookie is present (check Network tab)
- For Bearer token: ensure token not revoked
- Check token tags match secret tags

## DEPLOYMENT COMPLETE WHEN:

✅ URL is active and responsive
✅ Health check returns status: ok
✅ Auth guard correctly returns 401
✅ Dashboard redirects to login
✅ All 14 verification tests pass

---

Repository: https://github.com/adamsemien/adam-vault
Deployment Date: June 9, 2026
Status: READY FOR IMMEDIATE DEPLOYMENT
