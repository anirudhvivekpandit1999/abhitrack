export function parseDateValue(value) {
    if (value == null || value === '') return null;
    if (typeof value === 'number') {
        if (!isNaN(value) && value > 1e12) return value;
        if (!isNaN(value) && value > 1e9 && value < 1e11) return value * 1000;
        if (!isNaN(value) && value > 2e4 && value < 1e6) {
            const ms = (value - 25569) * 86400 * 1000;
            return ms;
        }
        return null;
    }
    const str = String(value).trim();
    if (!str) return null;
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d.getTime();
    const num = Number(str);
    if (!isNaN(num) && num > 1e12) return num;
    const excelEpoch = new Date(1899, 11, 30).getTime();
    if (!isNaN(num) && num > 0 && num < 100000) {
        const ms = excelEpoch + num * 86400 * 1000;
        return ms;
    }
    const parts = str.match(/(\d{1,4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,4})/);
    if (parts) {
        const [, a, b, c] = parts;
        const orders = [
            [a, b, c],
            [c, a, b],
            [c, b, a],
            [a, b, c]
        ];
        for (const [y, m, d] of orders) {
            const yr = y.length === 2 ? 2000 + parseInt(y, 10) : parseInt(y, 10);
            const mo = parseInt(m, 10) - 1;
            const da = parseInt(d, 10);
            if (yr > 1900 && yr < 2100 && mo >= 0 && mo < 12 && da >= 1 && da <= 31) {
                const date = new Date(yr, mo, da);
                if (date.getFullYear() === yr && date.getMonth() === mo && date.getDate() === da) {
                    return date.getTime();
                }
            }
        }
    }
    return null;
}

export function isDateColumn(data, columnName) {
    if (!data || !Array.isArray(data) || data.length === 0 || !columnName) return false;
    const sampleValues = data
        .slice(0, Math.min(20, data.length))
        .map(row => row?.[columnName])
        .filter(val => val != null && String(val).trim() !== '');
    if (sampleValues.length === 0) return false;
    const parsedCount = sampleValues.filter(val => parseDateValue(val) !== null).length;
    const ratio = parsedCount / sampleValues.length;
    if (ratio < 0.7) return false;
    const numericCount = sampleValues.filter(val => !isNaN(Number(val)) && Number(val) === parseInt(val, 10)).length;
    if (numericCount === sampleValues.length && sampleValues.every(v => {
        const n = Number(v);
        return n >= 1 && n <= 31 && String(v).length <= 2;
    })) return false;
    return true;
}

export function parseValueForPlot(value, isDateCol) {
    if (isDateCol) return parseDateValue(value);
    const num = Number(value);
    return isNaN(num) ? null : num;
}

export function formatDateForAxis(value) {
    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value);
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().split(' ')[0];
    return timeStr === '00:00:00' ? dateStr : `${dateStr} ${timeStr}`;
}

export function parseDateTimeFromInput(inputValue) {
    if (!inputValue) return null;
    const ts = parseDateValue(inputValue);
    return ts;
}

export function toDatetimeLocalString(timestamp) {
    if (timestamp == null || isNaN(timestamp)) return '';
    const d = new Date(timestamp);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day}T${h}:${min}`;
}
