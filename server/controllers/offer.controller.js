const offerService = require('../services/offer.service');
const { asyncHandler } = require('../middleware/errorHandler');

exports.createOffer = asyncHandler(async (req, res) => {
    const offer = await offerService.createOffer(req.user.userId, req.body);
    res.json(offer);
});

exports.getUserOffers = asyncHandler(async (req, res) => {
    const offers = await offerService.getUserOffers(req.user.userId);
    res.json(offers);
});

exports.getPartnerOffers = asyncHandler(async (req, res) => {
    const offers = await offerService.getPartnerOffers(req.user.userId);
    res.json(offers);
});

exports.updateOfferStatus = asyncHandler(async (req, res) => {
    const { status, counterAmount } = req.body;
    const offer = await offerService.updateOfferStatus(req.user.userId, req.params.id, status, counterAmount);
    res.json(offer);
});
