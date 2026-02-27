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

const ALLOWED_TAGS = new Set(["a", "b", "strong", "i", "em", "p", "br", "ul", "ol", "li", "span", "div"]);
const ALLOWED_ATTRS = new Set(["href", "target", "rel", "class"]);

/** Strip disallowed tags/attributes to prevent XSS when rendering API-sourced HTML */
export function sanitizeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");

  function walk(node: Element) {
    for (const child of [...node.children]) {
      if (!ALLOWED_TAGS.has(child.tagName.toLowerCase())) {
        child.replaceWith(...child.childNodes);
      } else {
        for (const attr of [...child.attributes]) {
          const val = attr.value.trim().toLowerCase();
          if (!ALLOWED_ATTRS.has(attr.name) || (attr.name === "href" && val.startsWith("javascript:"))) {
            child.removeAttribute(attr.name);
          }
        }
        walk(child);
      }
    }
  }

  walk(doc.body);
  return doc.body.innerHTML;
}
