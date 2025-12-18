// distrib en centimes

const DENOMINATIONS_CENTS = [
  50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100,
  50, 20, 10, 5, 2, 1
];


const parseToCents = (input) => {
    const string = input.trim();
    const normalized = string.replace(/\s+/g, '').replace(',', '.');
    const number = parseFloat(normalized);

    if (input === undefined || input === null || string === '' || isNaN(number)){
        return null;
    }

    return Math.round(number * 100);
};

const formatEuro = (cents) => {
    const euros = (cents / 100).toFixed(2);
    return euros.replace('.', ',') + ' €';
};


const getMinBills = (input) => {
    const cents = parseToCents(input);
    if (cents === null) {
        return { error: 'invalid', input };
    }

    if (cents <= 0){
        return { amount: 0, breakdown: [], totalNotes: 0, remainingCents: 0 };
    } 

    let remaining = cents;
    const breakdown = [];
    let totalNotes = 0;

    for (const denomination of DENOMINATIONS_CENTS) {
        const count = Math.floor(remaining / denomination);
        if (count > 0) {
        breakdown.push({ denomCents: denomination, label: formatEuro(denomination), count });
        totalNotes += count;
        remaining -= count * denomination;
        }
    }

    return {
        amount: cents / 100,
        breakdown,
        totalNotes,
        remainingCents: remaining
    };
};

export { getMinBills };
