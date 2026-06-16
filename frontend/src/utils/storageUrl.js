export function storageUrl(path) {
    if (!path) return '';
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${baseUrl}/storage/${path}`;
}