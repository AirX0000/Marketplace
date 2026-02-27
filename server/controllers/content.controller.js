const contentService = require('../services/content.service');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getJobs = asyncHandler(async (req, res) => {
    // Check if admin based on route or token? usually public, admin uses generic or specific
    // We can check req.user if present
    const isAdmin = req.user?.role === 'ADMIN';
    const jobs = await contentService.getJobs(isAdmin);
    res.json(jobs);
});

exports.createJob = asyncHandler(async (req, res) => {
    const job = await contentService.createJob(req.body);
    res.json(job);
});

exports.updateJob = asyncHandler(async (req, res) => {
    const job = await contentService.updateJob(req.params.id, req.body);
    res.json(job);
});

exports.deleteJob = asyncHandler(async (req, res) => {
    await contentService.deleteJob(req.params.id);
    res.json({ success: true });
});

exports.getPosts = asyncHandler(async (req, res) => {
    const isAdmin = req.user?.role === 'ADMIN';
    const posts = await contentService.getPosts(isAdmin);
    res.json(posts);
});

exports.getPostById = asyncHandler(async (req, res) => {
    const isAdmin = req.user?.role === 'ADMIN';
    const post = await contentService.getPostById(req.params.id, isAdmin);
    if (!post) return res.status(404).json({ error: "Not found" });
    res.json(post);
});

exports.createPost = asyncHandler(async (req, res) => {
    const post = await contentService.createPost(req.body);
    res.json(post);
});

exports.updatePost = asyncHandler(async (req, res) => {
    const post = await contentService.updatePost(req.params.id, req.body);
    res.json(post);
});

exports.deletePost = asyncHandler(async (req, res) => {
    await contentService.deletePost(req.params.id);
    res.json({ success: true });
});

exports.getPage = asyncHandler(async (req, res) => {
    const page = await contentService.getPage(req.params.slug);
    // Return empty object or default if not found? Or let frontend handle 404.
    // Given upsert logic in admin, public might 404 if not created. 
    // Let's return a default structure if not found to avoid 404 errors on public site for uninitialized pages
    if (!page) {
        return res.json({ title: req.params.slug, content: '' });
    }
    res.json(page);
});

exports.updatePage = asyncHandler(async (req, res) => {
    const page = await contentService.updatePage(req.params.slug, req.body);
    res.json(page);
});
