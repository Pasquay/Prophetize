export const MARKET_CATEGORIES = [
    'SPORTS',
    'CRYPTO',
    'POLITICS',
    'CULTURE',
    'TECHNOLOGY'
] as const;

export type MarketCategory = typeof MARKET_CATEGORIES[number];