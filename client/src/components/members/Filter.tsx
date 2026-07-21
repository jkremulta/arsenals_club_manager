import { ArrowUp, ArrowDown } from "lucide-react";

const COLUMNS = [
  { key: "name", label: "NAME", align: "left", type: "text" },
  { key: "rank", label: "RANK", align: "center", type: "number", step: 0.5 },
  { key: "birthday", label: "BIRTHDAY", align: "center", type: "date" },
  { key: "gender", label: "GENDER", align: "center", type: "select", options: ["Male", "Female"] },
];

const Filter = ({ sortKey, toggleSortColumn, flipDirection, sortDirection }) => {

  return (
    <div
      className="fixed left-3 right-3 top-auto sm:absolute sm:left-auto sm:right-0 sm:top-full
                  mt-2 w-auto sm:w-48 border-2 border-black bg-background
                  shadow-[3px_3px_0_0_rgba(0,0,0,1)] z-30 overflow-hidden"
    >
      <div className="px-3 py-2 border-b-2 border-black bg-card text-xs font-semibold tracking-widest text-muted-foreground">
        SORT BY
      </div>
      {COLUMNS.map((col) => {
        const isActive = sortKey === col.key;
        return (
          <div
            key={col.key}
            className={`flex items-center justify-between px-3 py-2 border-b border-black last:border-b-0 h-12 sm:h-10
                        ${isActive ? "bg-muted" : ""}
                      `}
          >
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none flex-1">
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => toggleSortColumn(col.key)}
                className="peer sr-only"
              />
              <span className="size-5 sm:size-4 shrink-0 border-2 border-black bg-background flex items-center justify-center
                          peer-checked:bg-accent transition-colors">
                {isActive && (
                  <svg viewBox="0 0 12 12" className="size-2 fill-none stroke-white stroke-[2.5]">
                    <path d="M2 6l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {col.label}
            </label>

            {isActive && (
              <button
                type="button"
                onClick={flipDirection}
                className="bg-accent p-1 sm:p-0.5 border-2 border-black shadow-[2px_2px_0px_black]
                            active:shadow-none active:translate-x-[2px] active:translate-y-[2px]
                            disabled:opacity-50"
              >
                {sortDirection === "asc"
                  ? <ArrowUp className="size-3.5 text-white" />
                  : <ArrowDown className="size-3.5 text-white" />}
              </button>
            )}
          </div>
        );
      })}
    </div>
  )
}

export default Filter