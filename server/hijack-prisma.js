const fs = require('fs');
const path = require('path');

// Target the actual Prisma CLI script that gets executed by npx
const prismaIndex = path.join(__dirname, 'node_modules', 'prisma', 'build', 'index.js');

if (fs.existsSync(prismaIndex)) {
    const original = fs.readFileSync(prismaIndex, 'utf8');
    
    // Check if we already injected to prevent double-injection, and cleanly remove old if needed
    const startMarker = '// --- BEGIN DO HIJACK ---';
    const endMarker = '// --- END DO HIJACK ---';
    
    let cleanOriginal = original;
    const startIndex = original.indexOf(startMarker);
    const endIndex = original.indexOf(endMarker);
    
    if (startIndex !== -1 && endIndex !== -1) {
        cleanOriginal = original.substring(0, startIndex) + original.substring(endIndex + endMarker.length + 1);
    }

    const injection = `
${startMarker}
// Ensure DIRECT_URL exists with proper SSL keys for Prisma schema validation on DigitalOcean
if (process.env.DATABASE_URL) {
    try {
        const { URL } = require('url');
        
        // 1. DIRECT_URL: Native DO Postgres connection is on port 25060.
        // We use the original DATABASE_URL (which DO defaults to 25060) and just enforce SSL.
        const directUrlObj = new URL(process.env.DATABASE_URL);
        if (directUrlObj.port === '25061') directUrlObj.port = '25060'; // Force 25060 for direct
        directUrlObj.searchParams.delete('pgbouncer');
        directUrlObj.searchParams.set('sslmode', 'require');
        process.env.DIRECT_URL = directUrlObj.toString();
        
        // 2. DATABASE_URL: For the actual app, we want to use DO's PgBouncer pool on 25061.
        const poolUrlObj = new URL(process.env.DATABASE_URL);
        if (poolUrlObj.port === '25060') poolUrlObj.port = '25061'; // Force 25061 for pooling
        poolUrlObj.searchParams.set('pgbouncer', 'true');
        poolUrlObj.searchParams.set('sslmode', 'require');
        process.env.DATABASE_URL = poolUrlObj.toString();
        
        console.warn('[Prisma Wrapper] Configured DIRECT_URL (25060) and DATABASE_URL (25061) for DigitalOcean.');
    } catch (e) {
        if (!process.env.DIRECT_URL) process.env.DIRECT_URL = process.env.DATABASE_URL;
    }
}
${endMarker}
`;

    let modified = cleanOriginal;
    // Insert right after the shebang (#!/usr/bin/env node)
    if (cleanOriginal.startsWith('#!')) {
        const firstNewline = cleanOriginal.indexOf('\n');
        if (firstNewline !== -1) {
            modified = cleanOriginal.substring(0, firstNewline + 1) + injection + cleanOriginal.substring(firstNewline + 1);
        }
    } else {
        modified = injection + cleanOriginal;
    }

    fs.writeFileSync(prismaIndex, modified, 'utf8');
    console.log('✅ [Prisma Hijack] Successfully injected connection routing into Prisma CLI.');
} else {
    console.warn('⚠️ [Prisma Hijack] Could not find Prisma CLI at ' + prismaIndex);
}
