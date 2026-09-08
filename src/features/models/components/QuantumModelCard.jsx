import { useSelector, useDispatch } from "react-redux";
import { Atom } from "lucide-react";
import Card from "../../../components/ui/Card";
import CardHeader from "../../../components/ui/CardHeader";
import SelectDropdown from "../../../components/ui/SelectDropdown";
import ParameterGrid from "../../../components/ui/ParameterGrid";
import SectionHeading from "../../../components/ui/SectionHeading";
import CircuitTopologyVisual from "./CircuitTopologyVisual";
import { quantumModelOptions, setQuantumModel } from "../modelsSlice";

export default function QuantumModelCard() {
  const dispatch = useDispatch();
  const { selectedModel, parameters, circuitTopology, status } = useSelector(
    (state) => state.models.quantum
  );

  return (
    <Card className="flex flex-col">
      <CardHeader
        icon={Atom}
        iconBg="bg-accent-purple-soft"
        iconColor="text-accent-purple"
        title="Quantum Model"
        subtitle="QML Classifier"
      />

      <SelectDropdown
        options={quantumModelOptions}
        value={selectedModel}
        onChange={(val) => dispatch(setQuantumModel(val))}
      />

      <div className="mt-5">
        <SectionHeading className="mb-2">Model Parameters</SectionHeading>
        <ParameterGrid parameters={parameters} />
      </div>

      <CircuitTopologyVisual nodes={circuitTopology} />

      {status === "running" && (
        <div className="mt-3 flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
          <span className="text-xs text-text-secondary">Running…</span>
        </div>
      )}
    </Card>
  );
}
