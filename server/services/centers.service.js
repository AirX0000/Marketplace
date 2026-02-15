const prisma = require('../config/database');

class CentersService {
    async getCenters(isAdmin) {
        const where = isAdmin ? {} : { isActive: true };
        return prisma.distributionCenter.findMany({
            where,
            orderBy: { name: 'asc' }
        });
    }

    async createCenter(data) {
        return prisma.distributionCenter.create({
            data: {
                name: data.name,
                address: data.address,
                lat: parseFloat(data.lat),
                lng: parseFloat(data.lng),
                isActive: data.isActive !== undefined ? data.isActive : true
            }
        });
    }

    async updateCenter(id, data) {
        return prisma.distributionCenter.update({
            where: { id },
            data: {
                ...data,
                lat: data.lat !== undefined ? parseFloat(data.lat) : undefined,
                lng: data.lng !== undefined ? parseFloat(data.lng) : undefined
            }
        });
    }

    async deleteCenter(id) {
        return prisma.distributionCenter.delete({
            where: { id }
        });
    }
}

module.exports = new CentersService();
