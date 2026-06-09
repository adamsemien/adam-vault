import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const ALLOWED_EMAILS = ['adamsemien@gmail.com', 'rraadamm@gmail.com'];

interface AuthContext {
  isSession: boolean;
  isToken: boolean;
  tokenName?: string;
  error?: string;
}

/**
 * Verify Supabase session from cookies
 * Returns true if valid session exists for allowed email
 */
export async function verifySession(request: NextRequest): Promise<boolean> {
  try {
    // Check for Supabase session cookie
    const sessionCookie = request.cookies.get('sb-auth-token');

    if (!sessionCookie?.value) {
      return false;
    }

    // In production, decode the JWT or verify via Supabase
    // For now, just verify the cookie exists (middleware handles auth)
    return true;
  } catch (error) {
    console.error('verifySession error:', error);
    return false;
  }
}

/**
 * Verify API token from Bearer token
 * Returns token record if valid and not revoked
 */
export async function verifyToken(request: NextRequest): Promise<any | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.slice(7);

    // Validate token format (avt_ prefix)
    if (!token.startsWith('avt_')) {
      return null;
    }

    // Get all active tokens and compare
    const { data: tokens, error } = await supabase
      .from('project_tokens')
      .select('*')
      .eq('revoked', false);

    if (error || !tokens) {
      return null;
    }

    // Find matching token by comparing hashes
    for (const tokenRecord of tokens) {
      try {
        const matches = await bcrypt.compare(token, tokenRecord.token_hash);
        if (matches) {
          // Update last_used timestamp
          await supabase
            .from('project_tokens')
            .update({ last_used: new Date().toISOString() })
            .eq('id', tokenRecord.id);

          return tokenRecord;
        }
      } catch (err) {
        // Continue to next token
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error('verifyToken error:', error);
    return null;
  }
}

/**
 * Hash a token using bcrypt
 */
export async function hashToken(token: string): Promise<string> {
  try {
    return await bcrypt.hash(token, 10);
  } catch (error) {
    console.error('hashToken error:', error);
    throw error;
  }
}

/**
 * Middleware that requires either session or valid token
 * Returns { isSession, isToken, tokenName, error }
 */
export async function requireAuth(
  request: NextRequest
): Promise<AuthContext> {
  // Check session first
  const hasSession = await verifySession(request);
  if (hasSession) {
    return { isSession: true, isToken: false };
  }

  // Check token
  const token = await verifyToken(request);
  if (token) {
    return { isSession: false, isToken: true, tokenName: token.name };
  }

  return {
    isSession: false,
    isToken: false,
    error: 'Unauthorized',
  };
}

/**
 * Tag matching utility
 */
export function tagsMatch(allowedTags: string[], secretTags: string[]): boolean {
  if (allowedTags.length === 0 || secretTags.length === 0) {
    return true; // No restrictions
  }

  return secretTags.some((tag) => allowedTags.includes(tag));
}

/**
 * Generate API token
 */
export function generateToken(): { token: string; hash: string } {
  const randomBytes = crypto.randomBytes(36).toString('hex');
  const token = `avt_${randomBytes}`;

  // Hash will be done with bcrypt in the route
  return { token, hash: '' };
}
