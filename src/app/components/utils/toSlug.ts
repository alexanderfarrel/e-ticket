function toSlug(title: string) {
  return title.toLowerCase().replace(/\s+/g, "-"); // "Event 1" -> "event-1"
}

export default toSlug;
