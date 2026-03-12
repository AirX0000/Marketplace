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
if (process.env.DATABASE_URL && (!process.env.DIRECT_URL || !process.env.DIRECT_URL.includes('sslmode'))) {
    try {
        const { URL } = require('url');
        const dbUrl = new URL(process.env.DATABASE_URL);
        if (dbUrl.port === '25060') {
            dbUrl.port = '25061'; // Use direct port instead of PgBouncer pool
            dbUrl.searchParams.delete('pgbouncer');
        }
        if (!dbUrl.searchParams.has('sslmode')) {
            dbUrl.searchParams.set('sslmode', 'require');
        }
        process.env.DIRECT_URL = dbUrl.toString();
        console.warn('[Prisma Wrapper] Injected SSL-enabled DIRECT_URL.');
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
    console.log('✅ [Prisma Hijack] Successfully injected DIRECT_URL workaround with SSL support into Prisma CLI.');
} else {
    console.warn('⚠️ [Prisma Hijack] Could not find Prisma CLI at ' + prismaIndex);
}
