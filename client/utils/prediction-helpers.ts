import { Prediction } from '../.expo/types/model';

// Some API endpoints return an array directly, others wrap it in { data: [...] }
export function extractPredictionList(payload: unknown): Prediction[] {
    if (Array.isArray(payload)) return payload as Prediction[];
    if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
        return (payload as { data: Prediction[] }).data;
    }
    return [];
}

// Some responses use "volume" instead of the canonical "total_volume"
export function normalizePrediction(item: Prediction & { volume?: number }): Prediction {
    return {
        ...item,
        total_volume: item.total_volume ?? item.volume ?? 0,
    };
}
