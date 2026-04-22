/**
 * Calculates profit amount and margin percentage
 * 
 * Formula:
 * profit = price - cost - shipping
 * margin = (profit / price) * 100
 */
export function calculateMargins(cost: number, shipping: number, price: number, fees: number = 0) {
    const totalCost = cost + shipping + fees;
    const profit = price - totalCost;
    const margin = price > 0 ? (profit / price) * 100 : 0;

    return {
        profit: profit.toFixed(2),
        margin: margin.toFixed(1),
        totalCost: totalCost.toFixed(2)
    };
}
