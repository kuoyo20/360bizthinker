import {
  type Bin,
  type Employee,
  NINEBOX_LABEL,
  nineboxBucket,
  type CapabilityPayload,
} from "@/lib/capability";

interface Props {
  employees: Employee[];
  payload: CapabilityPayload;
}

const X_BINS: Bin[] = ["low", "mid", "high"];
const Y_BINS: Bin[] = ["high", "mid", "low"]; // top → bottom
const X_LABEL: Record<Bin, string> = { low: "低", mid: "中", high: "高" };

export default function NineBoxChart({ employees, payload }: Props) {
  // Group employees by (xb, yb) bucket
  const cells = new Map<string, Employee[]>();
  for (const emp of employees) {
    const { xb, yb } = nineboxBucket(emp, payload);
    const key = `${xb}|${yb}`;
    const arr = cells.get(key) ?? [];
    arr.push(emp);
    cells.set(key, arr);
  }

  return (
    <div>
      <div className="grid grid-cols-[40px_1fr] gap-2">
        {/* Y axis label */}
        <div className="flex items-center justify-center">
          <span
            className="text-xs text-muted-foreground"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            核心職能（Y 軸）
          </span>
        </div>

        {/* 3x3 grid */}
        <div className="grid grid-cols-3 grid-rows-3 gap-2">
          {Y_BINS.map((yb) =>
            X_BINS.map((xb) => {
              const list = cells.get(`${xb}|${yb}`) ?? [];
              const label = NINEBOX_LABEL[xb][yb];
              const intensity =
                xb === "high" && yb === "high"
                  ? "bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-800"
                  : xb === "low" && yb === "low"
                    ? "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800"
                    : "border-border";
              return (
                <div
                  key={`${xb}-${yb}`}
                  className={`border rounded-md p-3 min-h-[110px] space-y-1 ${intensity}`}
                >
                  <p className="text-xs text-muted-foreground">{label}</p>
                  {list.length === 0 ? (
                    <p className="text-xs text-muted-foreground/50">—</p>
                  ) : (
                    <ul className="text-sm space-y-0.5">
                      {list.map((e) => (
                        <li key={e.id} className="truncate" title={e.name}>
                          • {e.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            }),
          )}
        </div>
      </div>

      {/* X axis labels under grid */}
      <div className="grid grid-cols-[40px_1fr] mt-2">
        <div></div>
        <div className="grid grid-cols-3 text-center text-xs text-muted-foreground">
          {X_BINS.map((xb) => (
            <div key={xb}>{X_LABEL[xb]}</div>
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-2">
        專業 + 領導（X 軸）
      </p>

      {/* Y axis side legend */}
      <div className="flex justify-center gap-4 mt-3 text-xs text-muted-foreground">
        <span>Y：核心職能 1-5</span>
        <span>X：專業（+ 領導，僅經理）1-5</span>
      </div>
    </div>
  );
}
