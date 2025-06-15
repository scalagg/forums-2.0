export function formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) {
        return `${years} year${years === 1 ? '' : 's'} ago`;
    }
    if (months > 0) {
        return `${months} month${months === 1 ? '' : 's'} ago`;
    }
    if (days > 0) {
        return `${days} day${days === 1 ? '' : 's'} ago`;
    }
    if (hours > 0) {
        return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }
    if (minutes > 0) {
        return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }
    if (seconds > 0) {
        return `${seconds} second${seconds === 1 ? '' : 's'} ago`;
    }
    return 'just now';
}

export function formatCalendarString(timestamp: number, includeTime: boolean = true): string {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...(includeTime && {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    };
    return date.toLocaleDateString(undefined, options);
}

export function formatTimeShort(timestamp: number): string {
    const hours = Math.floor(timestamp / 3600);
    const minutes = Math.floor((timestamp % 3600) / 60);
    const seconds = Math.floor(timestamp % 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
} 