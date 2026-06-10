/** YouTube still — 16:9 assets (`hqdefault` is 4:3 and letterboxes widescreen videos). */
export function youtubeThumb(videoId: string, quality: "hq" | "max" = "hq") {
  const file = quality === "max" ? "maxresdefault" : "mqdefault";
  return `https://i.ytimg.com/vi/${videoId}/${file}.jpg`;
}

/** Remote placeholder image (Elena creator card). */
export function unsplashPhoto(photoId: string, width = 1200) {
  return `https://images.unsplash.com/photo-${photoId}?w=${width}&q=85&auto=format&fit=crop`;
}
