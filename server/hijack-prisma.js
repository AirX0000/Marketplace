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
        let dbUrlStr = process.env.DATABASE_URL;
        const dbUrl = new URL(dbUrlStr);

        // Map DIRECT_URL (must not have pgbouncer=true)
        const directUrl = new URL(dbUrlStr);
        directUrl.searchParams.set('sslmode', 'require');
        directUrl.searchParams.delete('pgbouncer');
        directUrl.searchParams.delete('connection_limit');
        process.env.DIRECT_URL = directUrl.toString();

        // Map DATABASE_URL for regular app queries. We use local Prisma pooling (connection_limit=3)
        // to avoid exhausting DO's native 15-connection limit.
        const poolUrl = new URL(dbUrlStr);
        poolUrl.searchParams.set('sslmode', 'require');
        if (poolUrl.port === '25061') {
             poolUrl.searchParams.set('pgbouncer', 'true');
        } else {
             poolUrl.searchParams.delete('pgbouncer');
        }
        poolUrl.searchParams.set('connection_limit', '3'); // Strict local limit
        poolUrl.searchParams.set('pool_timeout', '10');
        process.env.DATABASE_URL = poolUrl.toString();
        
        console.warn('[Prisma Wrapper] Routed connections with safe limits applied.');
        }
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
