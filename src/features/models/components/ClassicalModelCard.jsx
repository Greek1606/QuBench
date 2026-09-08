import { useSelector, useDispatch } from "react-redux";
import { Cpu } from "lucide-react";
import Card from "../../../components/ui/Card";
import CardHeader from "../../../components/ui/CardHeader";
import SelectDropdown from "../../../components/ui/SelectDropdown";
import ParameterGrid from "../../../components/ui/ParameterGrid";
import StatusPill from "../../../components/ui/StatusPill";
import SectionHeading from "../../../components/ui/SectionHeading";
import { classicalModelOptions, setClassicalModel } from "../modelsSlice";

export default function ClassicalModelCard() {
  const dispatch = useDispatch();
  const { selectedModel, parameters, status, trainingNote } = useSelector(
    (state) => state.models.classical
  );

  return (
    <Card className="flex flex-col">
      <CardHeader
        icon={Cpu}
        iconBg="bg-blue-50"
        iconColor="text-info-blue"
        title="Classical Model"
        subtitle="Baseline Comparator"
      />

      <SelectDropdown
        options={classicalModelOptions}
        value={selectedModel}
        onChange={(val) => dispatch(setClassicalModel(val))}
      />

      <div className="mt-5">
        <SectionHeading className="mb-2">Model Parameters</SectionHeading>
        <ParameterGrid parameters={parameters} />
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl bg-surface-muted px-4 py-3">
        <StatusPill
          status={status === "ready" ? "success" : status === "failed" ? "neutral" : "info"}
          label={status === "ready" ? "Ready" : status === "failed" ? "Failed" : "Pending"}
        />
        <span className="text-xs text-text-secondary">{trainingNote}</span>
      </div>
    </Card>
  );
}
