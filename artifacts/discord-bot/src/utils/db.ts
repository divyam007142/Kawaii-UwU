import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function query(sql: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const res = await client.query(sql, params);
    return res;
  } finally {
    client.release();
  }
}

export async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      balance BIGINT DEFAULT 0,
      bank BIGINT DEFAULT 0,
      xp BIGINT DEFAULT 0,
      level INTEGER DEFAULT 1,
      daily_streak INTEGER DEFAULT 0,
      last_daily TIMESTAMP,
      last_work TIMESTAMP,
      last_beg TIMESTAMP,
      last_crime TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS inventory (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      UNIQUE(user_id, item_id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS trades (
      id SERIAL PRIMARY KEY,
      sender_id TEXT NOT NULL,
      receiver_id TEXT NOT NULL,
      sender_item TEXT,
      sender_coins BIGINT DEFAULT 0,
      receiver_item TEXT,
      receiver_coins BIGINT DEFAULT 0,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS guild_settings (
      guild_id TEXT PRIMARY KEY,
      welcome_channel_id TEXT,
      logs_channel_id TEXT,
      anime_drop_channel_id TEXT,
      welcome_message TEXT,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  console.log("[DB] Tables initialized");
}

export async function getGuildSettings(guildId: string) {
  const res = await query("SELECT * FROM guild_settings WHERE guild_id = $1", [guildId]);
  return res.rows[0] ?? null;
}

export async function setGuildSetting(guildId: string, key: string, value: string) {
  await query(
    `INSERT INTO guild_settings (guild_id, ${key}) VALUES ($1, $2)
     ON CONFLICT (guild_id) DO UPDATE SET ${key} = $2, updated_at = NOW()`,
    [guildId, value]
  );
}

export async function getUser(userId: string, username: string) {
  const existing = await query("SELECT * FROM users WHERE user_id = $1", [userId]);
  if (existing.rows.length > 0) return existing.rows[0];

  const inserted = await query(
    "INSERT INTO users (user_id, username) VALUES ($1, $2) RETURNING *",
    [userId, username]
  );
  return inserted.rows[0];
}

export async function addXp(userId: string, xpAmount: number) {
  const user = await query("SELECT xp, level FROM users WHERE user_id = $1", [userId]);
  if (!user.rows[0]) return null;

  const newXp    = parseInt(user.rows[0].xp) + xpAmount;
  const newLevel = Math.floor(0.1 * Math.sqrt(newXp)) + 1;
  const leveledUp = newLevel > user.rows[0].level;

  await query("UPDATE users SET xp = $1, level = $2 WHERE user_id = $3", [newXp, newLevel, userId]);
  return { newXp, newLevel, leveledUp };
}

export async function getInventory(userId: string) {
  const res = await query(
    "SELECT item_id, quantity FROM inventory WHERE user_id = $1",
    [userId]
  );
  return res.rows;
}

export async function addItem(userId: string, itemId: string, quantity = 1) {
  await query(
    `INSERT INTO inventory (user_id, item_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, item_id) DO UPDATE
     SET quantity = inventory.quantity + $3`,
    [userId, itemId, quantity]
  );
}

export async function removeItem(userId: string, itemId: string, quantity = 1): Promise<boolean> {
  const res = await query(
    "SELECT quantity FROM inventory WHERE user_id = $1 AND item_id = $2",
    [userId, itemId]
  );
  if (!res.rows[0] || res.rows[0].quantity < quantity) return false;

  if (res.rows[0].quantity === quantity) {
    await query("DELETE FROM inventory WHERE user_id = $1 AND item_id = $2", [userId, itemId]);
  } else {
    await query(
      "UPDATE inventory SET quantity = quantity - $3 WHERE user_id = $1 AND item_id = $2",
      [userId, itemId, quantity]
    );
  }
  return true;
}
