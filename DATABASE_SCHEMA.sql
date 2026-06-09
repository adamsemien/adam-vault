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
