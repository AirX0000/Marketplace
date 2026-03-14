const safeUserSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    avatar: true,
    isBlocked: true,
    balance: true,
    accountId: true,
    createdAt: true,
    phone: true,
    storeName: true,
    storeDescription: true,
    storeLogo: true,
    storeBanner: true,
    addresses: true,
    // Partner fields
    companyName: true,
    taxId: true,
    businessDescription: true,
    businessCategory: true,
    businessAddress: true,
    watchedListings: true,
    isPhoneVerified: true,
    isForcedVerified: true
};

const PROFESSIONAL_CATEGORIES = {
    REALTOR: 'Риелтор',
    NOTARY: 'Нотариус',
    APPRAISER: 'Оценка',
    INSURANCE: 'Страхование'
};

module.exports = { safeUserSelect, PROFESSIONAL_CATEGORIES };
