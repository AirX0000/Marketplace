const API_URL = import.meta.env.VITE_API_URL || '/api';

export const fetchAPI = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true',
        'ngrok-skip-browser-warning': 'true',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
    };

    if (headers['Content-Type'] === undefined) {
        delete headers['Content-Type'];
    }

    let url = `${API_URL}${endpoint}`;
    if (options.params) {
        const queryString = new URLSearchParams(options.params).toString();
        url += `?${queryString}`;
    }

    // Add timeout to prevent infinite loading
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
            }
            throw new Error("Session expired or unauthorized");
        }

        if (!response.ok) {
            let errorMessage = "API request failed";
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (e) {
                    errorMessage = "Error parsing response";
                }
            } else {
                try {
                    const errorText = await response.text();
                    if (errorText) errorMessage = errorText;
                } catch (e) {
                    errorMessage = "Error reading response text";
                }
            }
            throw new Error(errorMessage);
        }

        return response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - server took too long to respond');
        }
        throw error;
    }
};

export const api = {
    fetchAPI, // 🔧 Add for compatibility
    // Auth
    login: (data) => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data) => fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    sendVerification: (phone) => fetchAPI('/auth/send-verification', { method: 'POST', body: JSON.stringify({ phone }) }),
    verifyPhone: (phone, code) => fetchAPI('/auth/verify-phone', { method: 'POST', body: JSON.stringify({ phone, code }) }),
    sendOTP: (phone) => fetchAPI('/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) }),
    verifyOTP: (phone, code) => fetchAPI('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, code }) }),
    loginByOTP: (phone, code) => fetchAPI('/auth/login-otp', { method: 'POST', body: JSON.stringify({ phone, code }) }),
    resetPassword: (data) => fetchAPI('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),

    // Reviews
    getMarketplaceReviews: (id) => fetchAPI(`/reviews/marketplace/${id}`),
    createReview: (id, data) => fetchAPI(`/reviews/marketplace/${id}`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    deleteReview: (reviewId) => fetchAPI(`/reviews/${reviewId}`, {
        method: 'DELETE'
    }),

    // Security / KYC
    submitKYC: (data) => fetchAPI('/partner/kyc', { method: 'POST', body: JSON.stringify(data) }),
    getKYCStatus: () => fetchAPI('/partner/kyc'),

    // Public
    getMarketplaces: (params) => {
        const query = new URLSearchParams(params).toString();
        return fetchAPI(`/listings?${query}`);
    },
    getFeaturedMarketplaces: () => fetchAPI('/listings/featured'),
    getMarketplace: (id) => fetchAPI(`/listings/${id}`),
    getMarketplaceDetail: (id) => fetchAPI(`/listings/${id}`), // Alias for detail
    setTrustFlags: (id, flags) => fetchAPI(`/listings/${id}/trust`, { method: 'PATCH', body: JSON.stringify(flags) }),

    // AI
    getAIRecommendations: (query) => fetchAPI('/ai/recommend', { method: 'POST', body: JSON.stringify({ query }) }),
    aiChat: (message, history) => fetchAPI('/ai/chat', { method: 'POST', body: JSON.stringify({ message, history }) }),
    aiGenerateDescription: (productDetails) => fetchAPI('/ai/generate-description', { method: 'POST', body: JSON.stringify({ productDetails }) }),

    // Config Data
    getSettings: () => fetchAPI('/settings'),
    updateSettings: (data) => fetchAPI('/settings', { method: 'POST', body: JSON.stringify(data) }),

    getCategories: () => fetchAPI('/categories'),
    createCategory: (data) => fetchAPI('/categories', { method: 'POST', body: JSON.stringify(data) }),
    deleteCategory: (id) => fetchAPI(`/categories/${id}`, { method: 'DELETE' }),

    getRegions: () => fetchAPI('/regions'),
    createRegion: (data) => fetchAPI('/regions', { method: 'POST', body: JSON.stringify(data) }),
    deleteRegion: (id) => fetchAPI(`/regions/${id}`, { method: 'DELETE' }),

    // Favorites
    getFavorites: () => fetchAPI('/favorites'),
    addFavorite: (marketplaceId) => fetchAPI('/favorites', { method: 'POST', body: JSON.stringify({ marketplaceId }) }),
    removeFavorite: (marketplaceId) => fetchAPI(`/favorites/${marketplaceId}`, { method: 'DELETE' }),

    // Orders
    createOrder: (data) => fetchAPI('/orders', { method: 'POST', body: JSON.stringify(data) }),
    confirmOrderReceipt: (id) => fetchAPI(`/orders/${id}/confirm`, { method: 'POST' }),
    getOrders: () => fetchAPI('/orders'),
    getPartnerOrders: () => fetchAPI('/orders/partner'),
    updateOrderStatus: (id, status) => fetchAPI(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    getOrder: (id) => fetchAPI(`/orders/${id}`),

    // Reviews
    createReview: (data) => fetchAPI('/reviews', { method: 'POST', body: JSON.stringify(data) }),
    getReviews: (id) => fetchAPI(`/listings/${id}/reviews`),

    // User Profile
    getProfile: () => fetchAPI('/user/profile'),
    getUserProfile: () => fetchAPI('/user/profile'), // Alias for compatibility
    updateProfile: (data) => fetchAPI('/user/profile', { method: 'PUT', body: JSON.stringify(data) }),

    // Price Drop Alerts & Push Subscriptions
    watchPrice: (marketplaceId) => fetchAPI(`/users/watch-price/${marketplaceId}`, { method: 'POST' }),
    checkWatchStatus: (marketplaceId) => fetchAPI(`/users/watch-price/${marketplaceId}`),
    subscribePush: (subscription) => fetchAPI('/users/push-subscribe', { method: 'POST', body: JSON.stringify(subscription) }),

    // Recommendations
    getRecommendations: () => fetchAPI('/users/recommendations'),

    // Virtual Garage
    getGarageCars: () => fetchAPI('/user/garage'),
    addGarageCar: (data) => fetchAPI('/user/garage', { method: 'POST', body: JSON.stringify(data) }),
    deleteGarageCar: (carId) => fetchAPI(`/user/garage/${carId}`, { method: 'DELETE' }),

    transfer: (recipientId, amount) => fetchAPI('/wallet/transfer', { method: 'POST', body: JSON.stringify({ recipientIdentifier: recipientId, amount }) }),
    topUp: (amount) => fetchAPI('/wallet/topup', { method: 'POST', body: JSON.stringify({ amount }) }),
    createPayment: (data) => fetchAPI('/payment/create', { method: 'POST', body: JSON.stringify(data) }),

    // AutohousePay Dashboard
    getWallet: () => fetchAPI('/wallet'),
    walletDeposit: (amount) => fetchAPI('/wallet/deposit', { method: 'POST', body: JSON.stringify({ amount }) }),
    walletTransfer: (data) => fetchAPI('/wallet/transfer', { method: 'POST', body: JSON.stringify(data) }),

    // Addresses
    getAddresses: () => fetchAPI('/user/addresses'),
    addAddress: (data) => fetchAPI('/user/addresses', { method: 'POST', body: JSON.stringify(data) }),
    deleteAddress: (id) => fetchAPI(`/user/addresses/${id}`, { method: 'DELETE' }),

    // Wishlist Sharing
    getSharedWishlist: (userId) => fetchAPI(`/user/wishlist/${userId}`),
    toggleWishlistPrivacy: () => fetchAPI('/user/wishlist/privacy', { method: 'PUT' }),

    // Offers (Negotiation)
    createOffer: (data) => fetchAPI('/offers', { method: 'POST', body: JSON.stringify(data) }),
    getMyOffers: () => fetchAPI('/offers/my'),
    getPartnerOffers: () => fetchAPI('/partner/offers'),
    updateOfferStatus: (id, status, counterAmount) => fetchAPI(`/offers/${id}`, { method: 'PUT', body: JSON.stringify({ status, counterAmount }) }),

    // Partner
    getMyListings: () => fetchAPI('/partner/listings'),
    getPartnerOrders: () => fetchAPI('/partner/orders'),
    getPartnerCustomers: () => fetchAPI('/partner/customers'),
    getPartnerStats: () => fetchAPI('/partner/stats'),
    getPartnerFinance: () => fetchAPI('/partner/finance'),
    createListing: (data) => fetchAPI('/partner/listings', { method: 'POST', body: JSON.stringify(data) }),
    updateListing: (id, data) => fetchAPI(`/partner/listings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteListing: (id) => fetchAPI(`/partner/listings/${id}`, { method: 'DELETE' }),
    updateOrderItemStatus: (itemId, status) => fetchAPI(`/partner/orders/${itemId}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    sellerConfirmOrder: (orderId) => fetchAPI(`/orders/${orderId}/seller-confirm`, { method: 'POST' }),

    // Public Storefront
    getPartnerStore: (id) => fetchAPI(`/partners/${id}`),

    // Super Admin
    getAdminStats: () => fetchAPI('/admin/stats'),
    getAdminUsers: () => fetchAPI('/admin/users'),
    updateUserRole: (id, role) => fetchAPI(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
    updateUserBlock: (id, isBlocked) => fetchAPI(`/admin/users/${id}/block`, { method: 'PUT', body: JSON.stringify({ isBlocked }) }),
    updateUserVerification: (id, isVerified) => fetchAPI(`/admin/users/${id}/verify`, { method: 'PUT', body: JSON.stringify({ isVerified }) }),
    deleteUser: (id) => fetchAPI(`/admin/users/${id}`, { method: 'DELETE' }),
    createUser: (data) => fetchAPI('/admin/users', { method: 'POST', body: JSON.stringify(data) }),

    // Careers API
    getCareers: () => fetchAPI('/careers'),
    getAdminCareers: () => fetchAPI('/admin/careers'),
    createCareer: (data) => fetchAPI('/admin/careers', { method: 'POST', body: JSON.stringify(data) }),
    updateCareer: (id, data) => fetchAPI(`/admin/careers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteCareer: (id) => fetchAPI(`/admin/careers/${id}`, { method: 'DELETE' }),

    // Blog API
    getBlogPosts: () => fetchAPI('/blog'),
    getBlogPost: (id) => fetchAPI(`/blog/${id}`),
    getAdminBlogPosts: () => fetchAPI('/admin/blog'),
    createBlogPost: (data) => fetchAPI('/admin/blog', { method: 'POST', body: JSON.stringify(data) }),
    updateBlogPost: (id, data) => fetchAPI(`/admin/blog/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteBlogPost: (id) => fetchAPI(`/admin/blog/${id}`, { method: 'DELETE' }),

    // Admin Marketplace Moderation
    getAdminMarketplaces: (params = {}) => fetchAPI('/admin/marketplaces', { params }),
    updateMarketplaceStatus: (id, status) => fetchAPI(`/admin/marketplaces/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    }),
    deleteAdminListing: (id) => fetchAPI(`/admin/marketplaces/${id}`, { method: 'DELETE' }),
    sendBroadcast: (data) => fetchAPI('/admin/broadcast', { method: 'POST', body: JSON.stringify(data) }),
    getNewsletterStats: () => fetchAPI('/admin/newsletter/stats'),
    getNewsletterHistory: () => fetchAPI('/admin/newsletter/history'),

    // Tickets
    getTickets: () => fetchAPI('/tickets'),
    getTicket: (id) => fetchAPI(`/tickets/${id}`),
    createTicket: (data) => fetchAPI('/tickets', { method: 'POST', body: JSON.stringify(data) }),
    replyTicket: (id, message) => fetchAPI(`/tickets/${id}/reply`, { method: 'POST', body: JSON.stringify({ message }) }),
    // Removed duplicate updateMarketplaceStatus
    updateOrderStatus: (id, status) => fetchAPI(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    sellerConfirmOrder: (id) => fetchAPI(`/orders/${id}/seller-confirm`, { method: 'POST' }),
    updateTicketStatus: (id, status) => fetchAPI(`/tickets/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

    // Logistics (Centers)
    getCenters: () => fetchAPI('/centers'),
    createCenter: (data) => fetchAPI('/admin/centers', { method: 'POST', body: JSON.stringify(data) }),
    updateCenter: (id, data) => fetchAPI(`/admin/centers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteCenter: (id) => fetchAPI(`/admin/centers/${id}`, { method: 'DELETE' }),

    // Utils
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        // Use fetchAPI to get auth headers but don't set Content-Type manually for FormData
        return fetchAPI('/upload', {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': undefined // Let browser set Content-Type with boundary
            }
        });
    },

    // autohouse Pay Wallet
    getWallet: () => fetchAPI('/wallet'),
    walletDeposit: (amount) => fetchAPI('/wallet/deposit', { method: 'POST', body: JSON.stringify({ amount }) }),
    walletTransfer: (data) => fetchAPI('/wallet/transfer', { method: 'POST', body: JSON.stringify(data) }),
    // Admin Finance
    getPendingDeposits: () => fetchAPI('/admin/finance/deposits/pending'),
    approveDeposit: (transactionId) => fetchAPI('/admin/finance/deposits/approve', { method: 'POST', body: JSON.stringify({ transactionId }) }),
    rejectDeposit: (transactionId) => fetchAPI('/admin/finance/deposits/reject', { method: 'POST', body: JSON.stringify({ transactionId }) }),
    getAdminFinanceStats: () => fetchAPI('/admin/finance/stats'),

    // Returns
    createReturnRequest: (data) => fetchAPI('/returns', { method: 'POST', body: JSON.stringify(data) }),
    getMyReturnRequests: () => fetchAPI('/returns/my'),
    updateReturnStatus: (id, status, refundAmount) => fetchAPI(`/returns/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, refundAmount }) }),

    // Chat
    getChatRooms: () => fetchAPI('/chat/rooms'),
    getChatMessages: (roomId) => fetchAPI(`/chat/rooms/${roomId}/messages`),
    initiateChat: (targetUserId) => fetchAPI('/chat/initiate', { method: 'POST', body: JSON.stringify({ targetUserId }) }),

    // Loans
    createLoanApplication: (data) => fetchAPI('/loans', { method: 'POST', body: JSON.stringify(data) }),
    submitLoanApplication: (data) => fetchAPI('/loans', { method: 'POST', body: JSON.stringify(data) }), // Alias
    getMyLoanApplications: () => fetchAPI('/loans/my'),
    getAllLoanApplications: (status) => fetchAPI('/loans/admin/all', { params: status ? { status } : {} }),
    updateLoanApplicationStatus: (id, status, adminNote) => fetchAPI(`/loans/admin/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, adminNote })
    }),

    // CMS (Pages)
    getPage: (slug) => fetchAPI(`/pages/${slug}`),
    updatePage: (slug, data) => fetchAPI(`/pages/${slug}`, { method: 'PUT', body: JSON.stringify(data) }),
};
