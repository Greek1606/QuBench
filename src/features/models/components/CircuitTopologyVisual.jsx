const nodeColors = {
  qubit: "fill-accent-purple",
  gate: "fill-accent-purple-soft stroke-accent-purple",
  measure: "fill-info-blue",
};

export default function CircuitTopologyVisual({ nodes = [] }) {
  if (nodes.length === 0) return null;

  const width = 100;
  const height = 60;
  const padding = 8;
  const spacing = (width - padding * 2) / Math.max(nodes.length - 1, 1);

  return (
    <div className="mt-4">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/50">
        Circuit Topology
      </p>
      <div className="rounded-card bg-panel-dark p-4 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <line
            x1={padding}
            y1={height / 2}
            x2={width - padding}
            y2={height / 2}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="0.3"
          />

          {nodes.map((node, i) => {
            const cx = padding + i * spacing;
            const cy = height / 2;

            return (
              <g key={node.id ?? i}>
                {node.type === "measure" ? (
                  <rect
                    x={cx - 3} y={cy - 3} width={6} height={6} rx={1.5}
                    className={nodeColors.measure}
                    stroke="rgba(255,255,255,0.3)" strokeWidth="0.3"
                  />
                ) : node.type === "qubit" ? (
                  <rect
                    x={cx - 2.5} y={cy - 2.5} width={5} height={5} rx={1}
                    className={nodeColors.qubit}
                  />
                ) : (
                  <circle
                    cx={cx} cy={cy} r={3}
                    className={nodeColors.gate} strokeWidth="0.3"
                  />
                )}

                <text
                  x={cx} y={cy - 5.5} textAnchor="middle"
                  className="fill-white/80" fontSize="3"
                  fontFamily="Inter, sans-serif" fontWeight="600"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
