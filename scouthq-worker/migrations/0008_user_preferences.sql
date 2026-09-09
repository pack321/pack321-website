CREATE TABLE user_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  preferred_name TEXT,
  phone_e164 TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_preferences (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  appearance_mode TEXT NOT NULL DEFAULT 'system' CHECK(appearance_mode IN ('system','light','dark')),
  notifications_json TEXT NOT NULL DEFAULT '{}',
  accessibility_json TEXT NOT NULL DEFAULT '{}',
  communication_json TEXT NOT NULL DEFAULT '{}',
  calendar_json TEXT NOT NULL DEFAULT '{}',
  privacy_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
