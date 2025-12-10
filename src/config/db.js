import pkg from "pg";
const { Pool } = pkg;

// ✅ Singleton pool (AMAN untuk Local + Vercel)
let pool;

if (!global._pgPool) {
  global._pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 5,                   // batasi koneksi
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

pool = global._pgPool;

export default pool;
