/** YouTube still for Kathleen spotlight session previews. */
export function youtubeThumb(videoId: string, quality: "hq" | "max" = "hq") {
  const file = quality === "max" ? "maxresdefault" : "hqdefault";
  return `https://i.ytimg.com/vi/${videoId}/${file}.jpg`;
}

/** Remote placeholder image (Elena creator card). */
export function unsplashPhoto(photoId: string, width = 1200) {
  return `https://images.unsplash.com/photo-${photoId}?w=${width}&q=85&auto=format&fit=crop`;
}
