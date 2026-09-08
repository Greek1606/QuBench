import { useSelector } from "react-redux";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import Skeleton from "../../../components/ui/Skeleton";
import SectionHeading from "../../../components/ui/SectionHeading";

export default function DensityHistogram() {
  const { uploadStatus, densityHistogram, densityConfidenceValue } = useSelector(
    (state) => state.analysis
  );

  if (uploadStatus === "loading") {
    return (
      <Card className="flex flex-col">
        <div className="mb-3 flex items-center justify-between">
          <SectionHeading>Cellular Density Score</SectionHeading>
          <Skeleton className="h-5 w-16 rounded-pill" />
        </div>
        <Skeleton className="h-52 rounded-xl" />
      </Card>
    );
  }

  if (uploadStatus !== "succeeded" || densityHistogram.length === 0) return null;

  return (
    <Card className="flex flex-col">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading>Cellular Density Score</SectionHeading>
        <div className="flex items-center gap-2">
          <Badge variant="Q-State" />
          {densityConfidenceValue != null && (
            <span className="text-lg font-bold text-text-primary">
              {typeof densityConfidenceValue === "number"
                ? densityConfidenceValue.toFixed(4)
                : densityConfidenceValue}
            </span>
          )}
        </div>
      </div>

      <div className="h-48 sm:h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={densityHistogram} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 12 }}
            />
            <Bar dataKey="score" fill="var(--color-accent-purple)" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
