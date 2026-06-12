/** Parse a fetch response as JSON; surface HTML/error pages clearly. */
export async function readJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const trimmed = text.trimStart();
  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
    throw new Error(
      `API route not found (${res.status}). Restart the dev server and hard-refresh the page.`
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      res.ok
        ? "Server returned an invalid response."
        : `Request failed (${res.status}). Please try again.`
    );
  }
}
