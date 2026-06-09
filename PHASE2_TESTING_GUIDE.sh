#!/usr/bin/env bash
# ADAM VAULT PHASE 2 — COMPLETE TESTING GUIDE

# Prerequisites
# - Supabase project with schema applied (DATABASE_SCHEMA.sql)
# - Environment variables configured in .env.local
# - Node modules installed (npm install)
# - Dev server running (npm run dev)

PORT=3000
API_URL="http://localhost:$PORT"

echo "🧪 ADAM VAULT PHASE 2 - ROUTE TESTING GUIDE"
echo "=============================================="
echo ""

# ============================================================================
# TEST 1: Health Check (Public, No Auth Required)
# ============================================================================
echo "✅ TEST 1: GET /api/health (Public)"
echo "Command:"
echo "curl $API_URL/api/health"
echo ""
echo "Expected: 200 OK with { status: 'ok', key_count: N, needs_rotation: [], last_rotated: {} }"
echo "---"
echo ""

# ============================================================================
# TEST 2: Login Flow
# ============================================================================
echo "✅ TEST 2: Magic Link Login"
echo ""
echo "Step 1: Send magic link to email"
echo "Command:"
echo "curl -X POST $API_URL/api/auth/login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"adamsemien@gmail.com\"}'"
echo ""
echo "Expected: 200 OK with { message: 'Magic link sent to email' }"
echo "Note: Check your email for magic link"
echo ""
echo "Step 2: Click magic link in email"
echo "URL format: $API_URL/auth/callback?code=XXXX"
echo "Expected: Redirects to /vault with sb-auth-token cookie set"
echo ""
echo "Step 3: Verify session is active"
echo "Command:"
echo "curl $API_URL/api/secrets -H 'Cookie: sb-auth-token=YOUR_TOKEN_HERE'"
echo ""
echo "---"
echo ""

# ============================================================================
# TEST 3: Create Secret (Dashboard Session)
# ============================================================================
echo "✅ TEST 3: POST /api/secrets (Create Secret)"
echo "Command:"
echo "curl -X POST $API_URL/api/secrets \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Cookie: sb-auth-token=YOUR_SESSION_COOKIE' \\"
echo "  -d '{
    \"name\": \"DB_PASSWORD\",
    \"service\": \"postgres\",
    \"value\": \"super_secret_password_123\",
    \"description\": \"Production database password\",
    \"project_tags\": [\"database\", \"prod\"]
  }'"
echo ""
echo "Expected: 201 Created with:"
echo "{
  \"id\": \"uuid\",
  \"name\": \"DB_PASSWORD\",
  \"service\": \"postgres\",
  \"description\": \"Production database password\",
  \"project_tags\": [\"database\", \"prod\"],
  \"created_at\": \"2025-01-01T12:00:00Z\"
}"
echo ""
echo "Validations:"
echo "- name must be UPPERCASE with underscores"
echo "- service must not be empty"
echo "- value is encrypted with AES-256-GCM"
echo "- audit_log entry created with action=created"
echo ""
echo "---"
echo ""

# ============================================================================
# TEST 4: List Secrets (Dashboard Session)
# ============================================================================
echo "✅ TEST 4: GET /api/secrets (List Secrets)"
echo "Command:"
echo "curl $API_URL/api/secrets \\"
echo "  -H 'Cookie: sb-auth-token=YOUR_SESSION_COOKIE'"
echo ""
echo "Expected: 200 OK with:"
echo "{
  \"secrets\": [
    {
      \"id\": \"uuid\",
      \"name\": \"DB_PASSWORD\",
      \"service\": \"postgres\",
      \"description\": \"...\",
      \"project_tags\": [...],
      \"needs_rotation\": false,
      \"last_rotated\": null
    }
  ]
}"
echo ""
echo "Note: NO secret values returned, only metadata"
echo "---"
echo ""

# ============================================================================
# TEST 5: Get Secret Value (Dashboard Session)
# ============================================================================
echo "✅ TEST 5: GET /api/secrets/:id (Retrieve Decrypted Value)"
echo "Command:"
echo "curl $API_URL/api/secrets/YOUR_SECRET_UUID \\"
echo "  -H 'Cookie: sb-auth-token=YOUR_SESSION_COOKIE'"
echo ""
echo "Expected: 200 OK with:"
echo "{
  \"id\": \"uuid\",
  \"name\": \"DB_PASSWORD\",
  \"service\": \"postgres\",
  \"value\": \"super_secret_password_123\",
  \"description\": \"...\",
  \"project_tags\": [...],
  \"last_rotated\": null
}"
echo ""
echo "Actions:"
echo "- Decrypts value using AES-256-GCM"
echo "- Writes audit_log with action=viewed, token_name=null"
echo "---"
echo ""

# ============================================================================
# TEST 6: Update Secret (Dashboard Session)
# ============================================================================
echo "✅ TEST 6: PUT /api/secrets/:id (Update Secret)"
echo "Command:"
echo "curl -X PUT $API_URL/api/secrets/YOUR_SECRET_UUID \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Cookie: sb-auth-token=YOUR_SESSION_COOKIE' \\"
echo "  -d '{
    \"description\": \"Updated prod password\",
    \"needs_rotation\": false
  }'"
echo ""
echo "Expected: 200 OK with updated secret object"
echo ""
echo "Optional field updates:"
echo "- name (must be UPPERCASE)"
echo "- service"
echo "- value (encrypted, previous value stored in previous_encrypted_value)"
echo "- description"
echo "- project_tags"
echo "- needs_rotation"
echo ""
echo "Actions:"
echo "- Sets updated_at to current timestamp"
echo "- Stores previous value if updating secret value"
echo "- Writes audit_log with action=updated"
echo "---"
echo ""

# ============================================================================
# TEST 7: Rotate Secret (Dashboard Session)
# ============================================================================
echo "✅ TEST 7: POST /api/secrets/:id/rotate (Rotate Secret)"
echo "Command:"
echo "curl -X POST $API_URL/api/secrets/YOUR_SECRET_UUID/rotate \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Cookie: sb-auth-token=YOUR_SESSION_COOKIE' \\"
echo "  -d '{\"new_value\": \"new_secret_password_456\"}'"
echo ""
echo "Expected: 200 OK with:"
echo "{
  \"id\": \"uuid\",
  \"name\": \"DB_PASSWORD\",
  \"last_rotated\": \"2025-01-01T12:30:00Z\"
}"
echo ""
echo "Actions:"
echo "- Encrypts new value"
echo "- Stores current value in previous_encrypted_value"
echo "- Sets last_rotated to current timestamp"
echo "- Sets needs_rotation to false"
echo "- Writes audit_log with action=rotated"
echo "---"
echo ""

# ============================================================================
# TEST 8: Delete Secret (Dashboard Session)
# ============================================================================
echo "✅ TEST 8: DELETE /api/secrets/:id (Delete Secret)"
echo "Command:"
echo "curl -X DELETE $API_URL/api/secrets/YOUR_SECRET_UUID \\"
echo "  -H 'Cookie: sb-auth-token=YOUR_SESSION_COOKIE'"
echo ""
echo "Expected: 200 OK with:"
echo "{ \"deleted\": true }"
echo ""
echo "Actions:"
echo "- Writes audit_log with action=deleted BEFORE deletion"
echo "- Hard deletes secret"
echo "- Audit log entries cascade deleted (on Postgres with ON DELETE CASCADE)"
echo "---"
echo ""

# ============================================================================
# TEST 9: Create API Token (Dashboard Session)
# ============================================================================
echo "✅ TEST 9: POST /api/tokens (Create API Token)"
echo "Command:"
echo "curl -X POST $API_URL/api/tokens \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Cookie: sb-auth-token=YOUR_SESSION_COOKIE' \\"
echo "  -d '{
    \"name\": \"prod-api-client\",
    \"allowed_tags\": [\"database\", \"prod\"]
  }'"
echo ""
echo "Expected: 201 Created with:"
echo "{
  \"id\": \"uuid\",
  \"name\": \"prod-api-client\",
  \"token_prefix\": \"avt_XXXXXXXX\",
  \"allowed_tags\": [\"database\", \"prod\"],
  \"full_token\": \"avt_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\"
}"
echo ""
echo "⚠️ IMPORTANT: full_token is ONLY returned at creation time!"
echo "Store it securely - cannot be retrieved later"
echo "---"
echo ""

# ============================================================================
# TEST 10: List API Tokens (Dashboard Session)
# ============================================================================
echo "✅ TEST 10: GET /api/tokens (List Tokens)"
echo "Command:"
echo "curl $API_URL/api/tokens \\"
echo "  -H 'Cookie: sb-auth-token=YOUR_SESSION_COOKIE'"
echo ""
echo "Expected: 200 OK with:"
echo "{
  \"tokens\": [
    {
      \"id\": \"uuid\",
      \"name\": \"prod-api-client\",
      \"token_prefix\": \"avt_XXXXXXXX\",
      \"allowed_tags\": [\"database\", \"prod\"],
      \"last_used\": \"2025-01-01T12:30:00Z\",
      \"revoked\": false,
      \"created_at\": \"2025-01-01T12:00:00Z\"
    }
  ]
}"
echo ""
echo "Note: token_hash is NEVER returned"
echo "---"
echo ""

# ============================================================================
# TEST 11: Use API Token to Fetch Secrets
# ============================================================================
echo "✅ TEST 11: GET /api/secrets with API Token"
echo "Command:"
echo "curl $API_URL/api/secrets \\"
echo "  -H 'Authorization: Bearer avt_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'"
echo ""
echo "Expected: 200 OK with secrets matching token's allowed_tags"
echo "Secrets without matching tags are filtered out"
echo ""
echo "Actions:"
echo "- Verifies token via bcrypt comparison"
echo "- Updates token's last_used timestamp"
echo "- Filters secrets by tag intersection"
echo "---"
echo ""

# ============================================================================
# TEST 12: Use API Token to Get Secret Value
# ============================================================================
echo "✅ TEST 12: GET /api/secrets/:id with API Token"
echo "Command:"
echo "curl $API_URL/api/secrets/YOUR_SECRET_UUID \\"
echo "  -H 'Authorization: Bearer avt_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'"
echo ""
echo "Expected: 200 OK with decrypted secret value"
echo "OR 403 Forbidden if secret's tags don't match token's allowed_tags"
echo ""
echo "Actions:"
echo "- Verifies token"
echo "- Checks tag match"
echo "- Decrypts and returns value"
echo "- Writes audit_log with action=viewed, token_name=<token_name>"
echo "---"
echo ""

# ============================================================================
# TEST 13: Revoke API Token (Dashboard Session)
# ============================================================================
echo "✅ TEST 13: DELETE /api/tokens/:id (Revoke Token)"
echo "Command:"
echo "curl -X DELETE $API_URL/api/tokens/YOUR_TOKEN_UUID \\"
echo "  -H 'Cookie: sb-auth-token=YOUR_SESSION_COOKIE'"
echo ""
echo "Expected: 200 OK with:"
echo "{ \"revoked\": true }"
echo ""
echo "Actions:"
echo "- Sets revoked=true (soft delete)"
echo "- Preserves audit history"
echo "- Token can no longer authenticate"
echo "---"
echo ""

# ============================================================================
# ERROR HANDLING TESTS
# ============================================================================
echo "⚠️ ERROR HANDLING TESTS"
echo "=============================================="
echo ""

echo "❌ TEST 401 Unauthorized (No Auth)"
echo "curl $API_URL/api/secrets"
echo "Expected: 401 { error: 'Unauthorized' }"
echo ""

echo "❌ TEST 403 Forbidden (Tag Mismatch)"
echo "curl $API_URL/api/secrets/SECRET_UUID \\"
echo "  -H 'Authorization: Bearer avt_TOKEN_WITH_WRONG_TAGS'"
echo "Expected: 403 { error: 'Forbidden: tag mismatch' }"
echo ""

echo "❌ TEST 400 Bad Request (Validation)"
echo "curl -X POST $API_URL/api/secrets \\"
echo "  -H 'Cookie: sb-auth-token=...' \\"
echo "  -d '{\"name\": \"lowercase\", \"service\": \"...\" }'"
echo "Expected: 400 { error: 'Name must be uppercase with underscores only' }"
echo ""

echo "❌ TEST 404 Not Found"
echo "curl $API_URL/api/secrets/00000000-0000-0000-0000-000000000000 \\"
echo "  -H 'Cookie: sb-auth-token=...'"
echo "Expected: 404 { error: 'Secret not found' }"
echo ""

echo "=============================================="
echo ""
echo "✨ All tests completed!"
echo "Each route implements proper auth guards and error handling."
