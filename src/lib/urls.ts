export function withBase(path: string): string {
  if (typeof path !== 'string' || path.length === 0) {
    throw new TypeError('A site URL requires a non-empty path.');
  }
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const pathname = path.split(/[?#]/, 1)[0];
  if (!base || pathname === base || pathname?.startsWith(`${base}/`)) return path;
  return `${base}${path}`;
}
