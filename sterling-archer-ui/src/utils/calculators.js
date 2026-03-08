/**
 * Frontend Utility Helpers: The "Brain's" Calculators
 * This isolates business math (like asset valuation) from the UI components.
 * By keeping this separate, the "Mouth" (React components) never has to do math.
 */

/**
 * Calculates the total USD valuation of a crypto portfolio
 * @param {number|string} btcAmount - The amount of BTC
 * @param {number|string} usdtAmount - The amount of USDT
 * @param {number} currentBtcPrice - The current market price of BTC (default: 64500)
 * @returns {number} The total USD valuation
 */
export const calculateCryptoValuation = (btcAmount, usdtAmount, currentBtcPrice = 64500) => {
    const btc = Number(btcAmount || 0);
    const usdt = Number(usdtAmount || 0);
    const price = Number(currentBtcPrice || 64500);

    const btcValue = isNaN(btc) ? 0 : btc * price;
    const usdtValue = isNaN(usdt) ? 0 : usdt;

    return btcValue + usdtValue;
};
