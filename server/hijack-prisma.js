const fs = require('fs');
const path = require('path');

// Target the actual Prisma CLI script that gets executed by npx
const prismaIndex = path.join(__dirname, 'node_modules', 'prisma', 'build', 'index.js');

if (fs.existsSync(prismaIndex)) {
    const original = fs.readFileSync(prismaIndex, 'utf8');
    
    // Check if we already injected to prevent double-injection
    if (!original.includes('[Prisma Wrapper] Injected DIRECT_URL')) {
        const injection = `
// --- BEGIN DO HIJACK ---
// Ensure DIRECT_URL exists for Prisma schema validation on DigitalOcean
if (process.env.DATABASE_URL && !process.env.DIRECT_URL) {
    let baseDirect = process.env.DATABASE_URL.split('?')[0]; // Strip query params
    process.env.DIRECT_URL = baseDirect.replace(':25060', ':25061');
    console.warn('[Prisma Wrapper] Injected DIRECT_URL for DO compatibility.');
}
// --- END DO HIJACK ---
`;

        let modified = original;
        // Insert right after the shebang (#!/usr/bin/env node)
        if (original.startsWith('#!')) {
            const firstNewline = original.indexOf('\n');
            if (firstNewline !== -1) {
                modified = original.substring(0, firstNewline + 1) + injection + original.substring(firstNewline + 1);
            }
        } else {
            modified = injection + original;
        }

        fs.writeFileSync(prismaIndex, modified, 'utf8');
        console.log('✅ [Prisma Hijack] Successfully injected DIRECT_URL workaround into Prisma CLI.');
    } else {
        console.log('ℹ️ [Prisma Hijack] Workaround already present.');
    }
} else {
    console.warn('⚠️ [Prisma Hijack] Could not find Prisma CLI at ' + prismaIndex);
}
