export interface Secret {
  id: string;
  name: string;
  service: string;
  encrypted_value: string;
  iv: string;
  previous_encrypted_value: string | null;
  previous_iv: string | null;
  description: string | null;
  project_tags: string[];
  needs_rotation: boolean;
  last_rotated: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectToken {
  id: string;
  name: string;
  token_hash: string;
  token_prefix: string;
  allowed_tags: string[];
  last_used: string | null;
  created_at: string;
  revoked: boolean;
}

export interface AuditLog {
  id: string;
  secret_id: string;
  action: string;
  token_name: string;
  timestamp: string;
  note: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}
