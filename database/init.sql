CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50),
  password VARCHAR(50)
);

-- Delete existing records if any, to ensure idempotency when restarting
DELETE FROM users;

INSERT INTO users (username, password) VALUES ('admin', 'admin123');
INSERT INTO users (username, password) VALUES ('test', '123456');
