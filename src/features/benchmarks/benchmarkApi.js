import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../lib/api";

export const benchmarkApi = createApi({
  reducerPath: "benchmarkApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["Benchmark"],
  endpoints: (builder) => ({
    getBenchmarks: builder.query({
      query: (runId = "latest") => `/benchmarks/${runId}`,
      providesTags: ["Benchmark"],
    }),
  }),
});

export const { useGetBenchmarksQuery } = benchmarkApi;
