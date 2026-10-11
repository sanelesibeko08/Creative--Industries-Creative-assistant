/**
 * Trigger a browser file download with the given content.
 * Must be called from a browser context (client component or event handler).
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType = "text/markdown; charset=utf-8",
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
