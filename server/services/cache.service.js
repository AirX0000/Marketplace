const NodeCache = require('node-cache');

// Standard TTL of 1 hour (3600 seconds), check period of 2 minutes
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

console.log('🚀 [CacheService] Initialized (Standard TTL: 1h)');

module.exports = {
    get: (key) => {
        const value = cache.get(key);
        if (value) {
            console.log(`🔹 [Cache] HIT: ${key}`);
        } else {
            console.log(`🔸 [Cache] MISS: ${key}`);
        }
        return value;
    },
    set: (key, value, ttl) => {
        return cache.set(key, value, ttl);
    },
    del: (key) => {
        return cache.del(key);
    },
    flush: () => {
        return cache.flushAll();
    },
    // Keys constants
    KEYS: {
        CATEGORIES: 'categories_list',
        REGIONS: 'regions_list',
        BANNERS: 'banners_active_list',
        SETTINGS: 'settings_site'
    }
};
