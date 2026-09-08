import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ArrowRight } from "lucide-react";
import Button from "../../components/ui/Button";
import QuantumModelCard from "./components/QuantumModelCard";
import ClassicalModelCard from "./components/ClassicalModelCard";
import ExecutionStatusBar from "./components/ExecutionStatusBar";
import { executeModels } from "./modelsSlice";

export default function ModelsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { execution } = useSelector((state) => state.models);
  const isRunning = execution.status === "running";

  const handleProceed = async () => {
    try {
      await dispatch(executeModels()).unwrap();
      navigate("/benchmarks");
    } catch {
      // Execution failed — status bar shows error state
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">QML Models</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Configure quantum and classical models, then execute to compare performance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <QuantumModelCard />
        <ClassicalModelCard />
      </div>

      <ExecutionStatusBar />

      <div className="flex justify-end pt-2">
        <Button onClick={handleProceed} disabled={isRunning}>
          {isRunning ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Executing…
            </>
          ) : (
            <>
              Proceed to Evaluation
              <ArrowRight size={16} />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
