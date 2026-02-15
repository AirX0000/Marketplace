const prisma = require('../config/database');

class ContentService {
    // Careers
    async getJobs(isAdmin) {
        const where = isAdmin ? {} : { isActive: true };
        return prisma.jobPosting.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
    }

    async createJob(data) {
        return prisma.jobPosting.create({ data });
    }

    async updateJob(id, data) {
        return prisma.jobPosting.update({ where: { id }, data });
    }

    async deleteJob(id) {
        return prisma.jobPosting.delete({ where: { id } });
    }

    // Blog
    async getPosts(isAdmin) {
        const where = isAdmin ? {} : { isPublished: true };
        return prisma.blogPost.findMany({
            where,
            orderBy: isAdmin ? { createdAt: 'desc' } : { publishedAt: 'desc' }
        });
    }

    async getPostById(id, isAdmin) {
        const where = isAdmin ? { id } : { id, isPublished: true };
        return prisma.blogPost.findUnique({ where });
    }

    async createPost(data) {
        return prisma.blogPost.create({ data });
    }

    async updatePost(id, data) {
        return prisma.blogPost.update({ where: { id }, data });
    }

    async deletePost(id) {
        return prisma.blogPost.delete({ where: { id } });
    }

    // Static Pages
    async getPage(slug) {
        return prisma.staticPage.findUnique({ where: { slug } });
    }

    async updatePage(slug, data) {
        // Upsert to create if not exists
        return prisma.staticPage.upsert({
            where: { slug },
            update: { title: data.title, content: data.content },
            create: { slug, title: data.title || slug, content: data.content || '' }
        });
    }
}

module.exports = new ContentService();
