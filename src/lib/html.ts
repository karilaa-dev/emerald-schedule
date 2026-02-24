/** Decode HTML entities in a string (e.g. &amp; → &, &#39; → ') */
export function decodeEntities(str: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = str;
  return textarea.value;
}

/** Turn plain-text URLs into clickable links and ensure all links open in a new tab */
export function linkifyHtml(html: string): string {
  // Wrap bare URLs (not already inside an href="..." or >...</a>) in <a> tags
  const linked = html.replace(
    /(?<!=["'])(https?:\/\/[^\s<"]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  // Ensure existing <a> tags also open in new tabs
  return linked.replace(/<a\s+href=/g, '<a target="_blank" rel="noopener noreferrer" href=');
}
