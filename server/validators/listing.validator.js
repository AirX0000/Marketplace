const { z } = require('zod');

const listingSchema = z.object({
    name: z.string().min(3, "Title too short"),
    description: z.string().min(10, "Description too short"),
    price: z.number().positive("Price must be positive"),
    category: z.string().min(1, "Category is required"),
    region: z.string().optional(),
    image: z.string().optional(),
    images: z.union([z.string(), z.array(z.string())]).optional(),
    attributes: z.any().optional(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED']).optional()
});

module.exports = {
    listingSchema
};
