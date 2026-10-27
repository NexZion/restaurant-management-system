export function storageUrl(path) {
    if (!path) return '';
    if (/^(https?:|blob:|data:)/i.test(path)) return path;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${baseUrl.replace(/\/$/, '')}/storage/${String(path).replace(/^\/+/, '')}`;
}