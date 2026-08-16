/**
 * Universal Media URL Resolver
 * Resolves file paths and URLs gracefully across:
 * 1. Legacy local URLs ('/uploads/avatars/user.jpg', 'public/uploads/...')
 * 2. Cloud CDN URLs (CloudFront, Cloudflare R2 custom domain, Supabase CDN)
 * 3. Fallback placeholders for broken or missing images
 */

export interface MediaResolverOptions {
  fallbackUrl?: string;
  cdnUrl?: string;
  preferWebP?: boolean;
}

export const DEFAULT_AVATAR_FALLBACK = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
export const DEFAULT_COVER_FALLBACK = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200';

export function resolveMediaUrl(
  pathOrUrl?: string | null,
  options?: MediaResolverOptions
): string {
  if (!pathOrUrl || typeof pathOrUrl !== 'string' || pathOrUrl.trim() === '') {
    return options?.fallbackUrl || '';
  }

  const trimmed = pathOrUrl.trim();

  // 1. External absolute URLs (HTTP/HTTPS, Unsplash, Supabase, CloudFront, S3, Data URLs)
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // 2. Normalize local and relative paths
  let cleanPath = trimmed;
  if (cleanPath.startsWith('public/')) {
    cleanPath = cleanPath.replace(/^public\//, '/');
  }

  if (cleanPath.startsWith('/uploads/')) {
    return cleanPath;
  }

  if (cleanPath.startsWith('uploads/')) {
    return `/${cleanPath}`;
  }

  // 3. Category folder relative path (e.g. 'avatars/avatar_123.jpg')
  if (!cleanPath.startsWith('/')) {
    // If CDN URL option is provided, prepend CDN
    if (options?.cdnUrl) {
      const base = options.cdnUrl.endsWith('/') ? options.cdnUrl.slice(0, -1) : options.cdnUrl;
      return `${base}/${cleanPath}`;
    }
    return `/uploads/${cleanPath}`;
  }

  return cleanPath;
}

export function getAvatarUrl(avatarPath?: string | null): string {
  return resolveMediaUrl(avatarPath, { fallbackUrl: DEFAULT_AVATAR_FALLBACK });
}

export function getCoverUrl(coverPath?: string | null): string {
  return resolveMediaUrl(coverPath, { fallbackUrl: DEFAULT_COVER_FALLBACK });
}
