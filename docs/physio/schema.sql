-- physio.sweber.dev: tables from lib/schema.ts (physioUsers, physioTokens, physioSuggestions).
-- Idempotent and additive only: run in the Neon SQL editor, or use `npm run db:push`.

CREATE TABLE IF NOT EXISTS physio_users (
  id serial PRIMARY KEY,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  email_verified_at timestamp,
  session_version integer NOT NULL DEFAULT 0,
  polar_customer_id text,
  subscription_id text,
  subscription_status text NOT NULL DEFAULT 'none',
  subscription_product_id text,
  current_period_end timestamp,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  subscription_modified_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS physio_tokens (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES physio_users(id) ON DELETE CASCADE,
  type text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamp NOT NULL,
  used_at timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS physio_suggestions (
  id serial PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  user_id integer REFERENCES physio_users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'new',
  admin_note text NOT NULL DEFAULT '',
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
