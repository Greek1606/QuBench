import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchApi } from "../../lib/api";

export const uploadImage = createAsyncThunk(
  "analysis/uploadImage",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      return await fetchApi("/upload", { method: "POST", body: formData });
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

const initialState = {
  file: { name: null, sizeLabel: null },
  uploadStatus: "idle",
  error: null,
  featureCount: null,
  features: [],
  heatmapUrl: null,
  densityHistogram: [],
  densityConfidenceValue: null,
};

const analysisSlice = createSlice({
  name: "analysis",
  initialState,
  reducers: {
    resetAnalysis: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadImage.pending, (state, action) => {
        state.uploadStatus = "loading";
        state.error = null;
        const file = action.meta.arg;
        state.file = { name: file.name, sizeLabel: formatSize(file.size) };
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.uploadStatus = "succeeded";
        const d = action.payload;
        state.featureCount = d.featureCount ?? d.features?.length ?? 0;
        state.features = d.features ?? [];
        state.heatmapUrl = d.heatmapUrl ?? d.heatmap_url ?? null;
        state.densityHistogram = d.densityHistogram ?? d.density_histogram ?? [];
        state.densityConfidenceValue = d.densityConfidenceValue ?? d.density_confidence_value ?? null;
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.uploadStatus = "failed";
        state.error = action.payload || "Upload failed";
      });
  },
});

export const { resetAnalysis } = analysisSlice.actions;
export default analysisSlice.reducer;

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
