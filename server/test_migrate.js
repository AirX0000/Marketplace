const { execSync } = require('child_process');

process.env.DATABASE_URL = "postgresql://user:password@app-abc-123.db.ondigitalocean.com:25060/db?sslmode=require";

try {
  const result = execSync('bash migrate.sh', { encoding: 'utf-8', env: process.env });
  console.log(result);
} catch (e) {
  console.error("Script failed:", e.message);
  if (e.stdout) console.log(e.stdout);
}
