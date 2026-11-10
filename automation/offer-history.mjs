import { offerDeduplicationKey } from './offer-normalization.mjs';

export function createOfferHistoryObservation(result = {}, offer = {}) {
  return {
    market: result.market,
    store: result.store,
    location: result.location,
    name: offer.name,
    price: offer.price,
    ...(offer.regularPrice ? { regularPrice: offer.regularPrice } : {}),
    priceValue: Number(String(offer.price || '').replace(',', '.').replace(/[^0-9.]/g, '')) || null,
    packSize: offer.packSize || '1 Packung',
    validUntil: offer.validUntil,
    imageUrl: offer.imageUrl || '',
    sourceUrl: result.sourceUrl,
    observedAt: result.fetchedAt,
  };
}

export function offerHistoryKey(observation = {}) {
  return String(observation.market || '') + '|' + offerDeduplicationKey(observation);
}
