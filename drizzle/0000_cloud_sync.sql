CREATE TABLE IF NOT EXISTS user_state (
  user_id TEXT PRIMARY KEY NOT NULL,
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
