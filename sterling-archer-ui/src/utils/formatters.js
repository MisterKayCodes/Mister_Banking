/**
 * Frontend Utility Helpers: The "Mouth's" Vocabulary
 * This centralizes all number formatting so components 
 * don't have to think about decimals, currency symbols, or "0E-8".
 */

/**
 * Formats standard fiat currency (e.g., USD -> $1,234.56)
 * @param {number|string} amount - The amount to format
 * @param {string} currency - The fiat currency code (default: USD)
 * @returns {string} Formatted string
 */
export const formatFiat = (amount, currency = 'USD') => {
    const numericAmount = parseFloat(amount || 0);
    if (isNaN(numericAmount)) return `$0.00`;

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numericAmount);
};

/**
 * Formats cryptocurrency balances and protects against scientific notation (0E-8)
 * @param {number|string} amount - The crypto amount
 * @param {string} coin - BTC or USDT
 * @param {boolean} includeSymbol - Whether to append the coin name (e.g., '1.5 BTC')
 * @returns {string} Formatted string
 */
export const formatCrypto = (amount, coin, includeSymbol = false) => {
    const numericAmount = Number(amount || 0);
    if (isNaN(numericAmount)) return includeSymbol ? `0.00 ${coin}` : '0.00';

    const isBTC = coin?.toUpperCase() === 'BTC';
    const decimals = isBTC ? 8 : 2;

    // We use toFixed first to stop '0E-8' bugs, then manually add commas if needed,
    // or just return the fixed string since crypto usually doesn't need commas for decimals.
    const formatted = numericAmount.toFixed(decimals);

    return includeSymbol ? `${formatted} ${coin.toUpperCase()}` : formatted;
};
