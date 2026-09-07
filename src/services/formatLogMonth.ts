export function formatLogMonth(year: string, month: string): string {
    const y = Number(year);
    const m = Number(month);

    if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) {
        return `${year}/${month}`;
    }

    const monthName = new Date(y, m - 1, 1).toLocaleDateString(undefined, {
        month: "long",
    });

    return `${monthName}, ${year}`;
}
