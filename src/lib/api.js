/**
 * Shared API configuration and helpers.
 * Single source of truth for the backend base URL and common fetch logic.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Fetch JSON from the API with standard error handling.
 * Used by createAsyncThunk in analysis, models, and benchmarks slices.
 */
export async function fetchApi(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, options);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed (${response.status})`);
  }

  return response.json();
}
