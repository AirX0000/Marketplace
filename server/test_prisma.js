const { execSync } = require('child_process');

// Try a Prisma generate without DIRECT_URL
try {
  console.log("Testing generation without DIRECT_URL...");
  execSync('npx prisma validate', { stdio: 'inherit', env: { ...process.env, DATABASE_URL: "postgresql://user:password@localhost:5432/db", DIRECT_URL: undefined }});
} catch (e) {
  console.log("Failed as expected.");
}

// Try with fallback in package.json
