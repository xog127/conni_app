
function timeAgo(firebaseTimestamp) {
    const seconds = firebaseTimestamp.seconds;
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const diff = now - seconds; // Difference in seconds

    let rtf = { format: (value, unit) => `${value} ${unit}${Math.abs(value) > 1 ? 's' : ''} ago` };
    
    // try {
    //     rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    // } catch (error) {
    //     console.warn('Intl.RelativeTimeFormat is not supported, using fallback');
    //     rtf = { format: (value, unit) => `${value} ${unit}${Math.abs(value) > 1 ? 's' : ''} ago` };
    // }

    const units = [
        { unit: 'year', seconds: 31536000 },
        { unit: 'month', seconds: 2592000 },
        { unit: 'week', seconds: 604800 },
        { unit: 'day', seconds: 86400 },
        { unit: 'hour', seconds: 3600 },
        { unit: 'minute', seconds: 60 },
        { unit: 'second', seconds: 1 }
    ];

    if (Math.abs(diff) < 5) {
        return "just now"; // If it's too recent, return 'just now'
    }

    for (const { unit, seconds: unitSeconds } of units) {
        if (Math.abs(diff) >= unitSeconds || unit === 'second') {
            return rtf.format(Math.abs(Math.floor(diff / unitSeconds)), unit);
        }
    }
}

export { timeAgo };