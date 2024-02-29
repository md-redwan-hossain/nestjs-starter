-- migrate:up
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  user_name VARCHAR(256) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name VARCHAR(256) NOT NULL,
  phone_number VARCHAR(30) UNIQUE,
  email VARCHAR(256) UNIQUE,
  gender CHAR(1) NOT NULL CHECK (gender IN ('m', 'f', 'o')),
  profile_picture_id UUID,
  image_file_extension VARCHAR(4) CHECK (
    image_file_extension IN ('png', 'jpg', 'jpeg', 'webp', 'gif')
  ),
  authenticator_key TEXT,
  recovery_codes TEXT [],
  is_lockout_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  is_2fa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  is_email_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  is_phone_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  CONSTRAINT "ensure at least email or phone number exists" CHECK (
    users.email IS NOT NULL
    OR users.phone_number IS NOT NULL
  ),
  CONSTRAINT "ensure valid email confirmation status" CHECK (
    NOT (
      users.is_email_confirmed = TRUE
      AND users.email IS NULL
    )
  ),
  CONSTRAINT "ensure valid phone number confirmation status" CHECK (
    NOT (
      users.is_phone_confirmed = TRUE
      AND users.phone_number IS NULL
    )
  ),
  CONSTRAINT "ensure valid 2fa enabled status" CHECK (
    NOT (
      users.authenticator_key IS NULL
      AND users.recovery_codes IS NULL
      AND users.is_2fa_enabled = TRUE
    )
  )
);

CREATE TABLE IF NOT EXISTS roles (
  id SMALLSERIAL PRIMARY KEY,
  name VARCHAR(25) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS user_roles (
  role_id SMALLINT NOT NULL,
  user_id BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  PRIMARY KEY (role_id, user_id),
  FOREIGN KEY (role_id) REFERENCES roles (id),
  FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS stuff_data (
  user_id BIGINT PRIMARY KEY,
  approver_id BIGINT,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (approver_id) REFERENCES users (id),
  CONSTRAINT "ensure approver_id is present when is_approved is true" CHECK (
    stuff_data.is_approved = TRUE
    AND stuff_data.approver_id IS NOT NULL
  )
);

CREATE INDEX ON user_roles (user_id);

CREATE INDEX ON stuff_data (approver_id);

-- migrate:down
drop table stuff_data;

drop table user_roles;

drop table users;

drop table roles;

drop type gender;