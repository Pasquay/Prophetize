/**
 * Utility for Supabase pagination range calculation.
 * Supabase uses 0-indexed ranges (.range(from, to)).
 * * @param page The current page number (0-indexed)
 * @param size The number of records to return per page
 * @returns { from: number, to: number }
 */
export const getPaginationRange = (page: number, size: number) => {
    const safePage = Math.max(0, page);
    const limit = size > 0 ? +size : 10;
    
    const from = safePage * limit;
    const to = from + limit - 1;

    return { from, to };
};