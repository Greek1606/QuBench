import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import Card from "../../../components/ui/Card";
import Skeleton from "../../../components/ui/Skeleton";
import SectionHeading from "../../../components/ui/SectionHeading";

export default function ConvergenceChart({ data = [], loading = false }) {
  if (loading) {
    return (
      <Card className="flex flex-col">
        <SectionHeading className="mb-3">Convergence Curve</SectionHeading>
        <Skeleton className="h-64 rounded-xl" />
      </Card>
    );
  }

  if (data.length === 0) return null;

  return (
    <Card className="flex flex-col">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading>Convergence Curve</SectionHeading>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-text-secondary">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent-purple" />VQC
          </span>
          <span className="flex items-center gap-1.5 text-xs text-text-secondary">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-400" />SVM
          </span>
        </div>
      </div>

      <div className="h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="epoch" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 12 }} />
            <Line type="monotone" dataKey="vqcLoss" stroke="var(--color-accent-purple)" strokeWidth={2} dot={false} name="VQC Loss" />
            <Line type="monotone" dataKey="svmLoss" stroke="#9CA3AF" strokeWidth={2} strokeDasharray="6 3" dot={false} name="SVM Loss" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
