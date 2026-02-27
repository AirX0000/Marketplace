const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Verifying CMS functionality...");

    const slug = 'test-verification-page';
    const title = 'Test Page';
    const content = '<h1>Hello World</h1>';

    try {
        // 1. Clean up potential previous run
        await prisma.staticPage.deleteMany({ where: { slug } });

        // 2. Create a page (simulating Admin PUT)
        console.log("Creating page...");
        const page = await prisma.staticPage.create({
            data: {
                slug,
                title,
                content
            }
        });
        console.log("Page created:", page.id);

        // 3. Fetch the page (simulating Public GET)
        console.log("Fetching page...");
        const fetchedPage = await prisma.staticPage.findUnique({
            where: { slug }
        });

        if (!fetchedPage) throw new Error("Failed to fetch page");
        if (fetchedPage.title !== title) throw new Error("Title mismatch");
        if (fetchedPage.content !== content) throw new Error("Content mismatch");

        console.log("Verification SUCCESS: Page created and fetched correctly.");

        // 4. Update the page
        console.log("Updating page...");
        const updatedPage = await prisma.staticPage.update({
            where: { slug },
            data: { content: '<h2>Updated Content</h2>' }
        });

        if (updatedPage.content !== '<h2>Updated Content</h2>') throw new Error("Update failed");
        console.log("Verification SUCCESS: Page updated correctly.");

        // Cleanup
        await prisma.staticPage.delete({ where: { slug } });

    } catch (e) {
        console.error("Verification FAILED:", e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
