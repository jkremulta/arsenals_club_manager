import { useEffect, useRef } from "react";
import { ArrowUp, ArrowDown, SlidersHorizontal, Search, X } from "lucide-react";
import { Table } from "@/components/retroui/Table";
import { useUIStore } from "@/stores/useUIStore";
import { Dialog } from "@/components/retroui/Dialog"
import { useLoginStore } from "@/stores/useLoginStore";
import { useMembers } from "@/hooks/useMembers";
import helper from "@/utils/helper";

const COLUMNS = [
  { key: "name", label: "NAME", align: "left" },
  { key: "rank", label: "RANK", align: "center" },
  { key: "birthday", label: "BIRTHDAY", align: "center" },
  { key: "gender", label: "GENDER", align: "center" },
];

const MembersTab = () => {
  const { user } = useLoginStore()
  const { membersTabOpen, setMembersTabOpen, filterOpen, setFilterOpen } = useUIStore()
  const { 
    visiblePlayers, 
    query, 
    setQuery, 
    sortKey, 
    sortDirection, 
    toggleSortColumn, 
    flipDirection 
  } = useMembers(user?.token)

  const filterRef = useRef(null)

  useEffect(() => {
    if (!filterOpen) return
    const handleClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [filterOpen, setFilterOpen])

  return (
    <Dialog 
      open={membersTabOpen} 
      onOpenChange={setMembersTabOpen}
    >
      <Dialog.Content size='lg' className="h-[85vh] sm:h-[70vh] border-2 border-black flex flex-col p-0 overflow-hidden">
        {/* Search + filter bar */}
        <div className="p-3 sm:px-5 border-b-2 border-black bg-card shrink-0 flex gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-5 sm:size-4 text-muted-foreground z-20 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search members..."
              className="w-full h-11 sm:h-9 px-10 sm:px-9 border-2 border-black bg-background text-sm text-foreground
                placeholder:text-muted-foreground rounded-none relative
                shadow-[2px_2px_0_0_rgba(0,0,0,1)]
                focus:outline-none focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:-translate-y-[1px] focus:translate-x-[-1px]
                transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-20"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Filter/sort trigger */}
          <div className="relative shrink-0" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen(!filterOpen)}
              className={`relative h-11 w-11 sm:h-9 sm:w-9 shrink-0 flex items-center justify-center border-2 border-black rounded-none
                shadow-[2px_2px_0_0_rgba(0,0,0,1)]
                active:shadow-none active:translate-x-[2px] active:translate-y-[2px]
                transition-all
                ${sortKey ? "bg-accent text-accent-foreground" : "bg-background text-foreground hover:bg-muted"}
              `}
            >
              <SlidersHorizontal
                className={`size-5 sm:size-4 ${
                  sortKey ? "text-white" : "text-muted-foreground"
                }`}
              />
              {sortKey && (
                <span className="absolute -top-1.5 -right-1.5 size-2.5 rounded-full bg-accent border border-black" />
              )}
            </button>

            {filterOpen && (
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
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Mobile: card list */}
          <div className="sm:hidden divide-y divide-black">
            {visiblePlayers.length > 0 ? (
              visiblePlayers.map((p) => (
                <div key={p.id} className="p-4 bg-background active:bg-muted">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-foreground">{p.name}</span>
                    <span className="text-xs tracking-widest text-muted-foreground">
                      RANK: {p.rank}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{helper.formatDate(p.birthday)}</span>
                    <span>{p.gender}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8 px-4">
                No members match "{query}"
              </div>
            )}
          </div>

          {/* Desktop: table */}
          <Table className="hidden sm:table border-none shadow-none">
            <Table.Header className="sticky top-0 z-10 border-b-2 border-black">
              <Table.Row className="bg-card font-sans hover:bg-card">
                {COLUMNS.map((col) => (
                  <Table.Head
                    key={col.key}
                    className={`py-4 px-5 tracking-widest font-semibold
                      ${col.align === "center" ? "text-center" : "text-left"}
                      ${sortKey === col.key ? "text-foreground" : "text-muted-foreground"}
                    `}
                  >
                    {col.label}
                  </Table.Head>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body className="[&_td]:py-4 [&_td]:px-5">
              {visiblePlayers.length > 0 ? (
                visiblePlayers.map((p) => (
                  <Table.Row 
                    key={p.id}
                    className="border-b border-black hover:bg-muted bg-background"
                  >
                    <Table.Cell className="text-foreground">
                      {p.name}
                    </Table.Cell>
                    <Table.Cell className="text-foreground text-center">
                      {p.rank}
                    </Table.Cell>
                    <Table.Cell className="text-center text-foreground">
                      {helper.formatDate(p.birthday)}
                    </Table.Cell>
                    <Table.Cell className="text-center text-foreground">
                      {p.gender}
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row className="hover:bg-background bg-background">
                  <Table.Cell colSpan={4} className="text-center text-muted-foreground py-8">
                    No members match "{query}"
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </div>
      </Dialog.Content>
    </Dialog>
  )
}
export default MembersTab