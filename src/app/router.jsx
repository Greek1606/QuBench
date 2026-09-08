import { createBrowserRouter, Navigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import AnalysisPage from "../features/analysis/AnalysisPage";
import ModelsPage from "../features/models/ModelsPage";
import BenchmarksPage from "../features/benchmarks/BenchmarksPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/overview" replace /> },
      { path: "overview", element: <AnalysisPage /> },
      { path: "models", element: <ModelsPage /> },
      { path: "benchmarks", element: <BenchmarksPage /> },
    ],
  },
]);
