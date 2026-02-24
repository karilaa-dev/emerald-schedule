/** Decode HTML entities in a string (e.g. &amp; → &, &#39; → ') */
export function decodeEntities(str: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = str;
  return textarea.value;
}
