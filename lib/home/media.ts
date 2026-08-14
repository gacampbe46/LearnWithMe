/** Remote placeholder image (Elena creator card). */
export function unsplashPhoto(photoId: string, width = 1200) {
  return `https://images.unsplash.com/photo-${photoId}?w=${width}&q=85&auto=format&fit=crop`;
}
