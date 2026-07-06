import { useState } from "react";
import { SlidersHorizontal, Search, X, Pencil, Check } from "lucide-react";
import { Table } from "@/components/retroui/Table";
import { useUIStore } from "@/stores/useUIStore";
import { Dialog } from "@/components/retroui/Dialog"
import { useLoginStore } from "@/stores/useLoginStore";
import { useMembers } from "@/hooks/useMembers";
import EditableField from "./EditableField";
import helper from "@/utils/helper";
import Filter from "./Filter";

const MEMBER_FIELDS = [
  { key: "name", label: "NAME", align: "left", type: "text" },
  { key: "rank", label: "RANK", align: "center", type: "number", step: 0.5 },
  { key: "birthday", label: "BIRTHDAY", align: "center", type: "date" },
  { key: "gender", label: "GENDER", align: "center", type: "select", options: ["Male", "Female"] },
];


const MembersTab = () => {

  const { user } = useLoginStore()
  const { membersTabOpen, setMembersTabOpen, filterOpen, setFilterOpen } = useUIStore()
  const {
    visiblePlayers,
    query,
    setQuery,
    sortKey,
    updateField,
    toggleSortColumn,
    flipDirection,
    sortDirection
  } = useMembers(user?.token)

  const [editMode, setEditMode] = useState(false)
  const [draftMap, setDraftMap] = useState({})

  const toggleEditMode = () => {
    if (!editMode) {
      setEditMode(true)
    } else {
      commitAllChanges()
      setEditMode(false)
      setDraftMap({})
    }
  }

  const handleDraftChange = (player, col, value) => {
    setDraftMap((prev) => ({
      ...prev,
      [player.id]: {
        ...prev[player.id],
        [col.key]: value,
      },
    }))
  }

  const commitAllChanges = () => {
    Object.entries(draftMap).forEach(([playerId, changes]) => {
      const player = visiblePlayers.find(p => String(p.id) === playerId)

      if (player) {
        updateField(player, changes)
      }
    })
  }

  const renderDesktopField = (player, col) => {
    const display =
      col.key === "birthday"
        ? helper.formatDate(player[col.key])
        : player[col.key]

    if (!editMode) {
      return (
        <div className="h-8 px-2 flex items-center">
          <span className="w-full">{display}</span>
        </div>
      )
    }

    return (
      <div className="h-10 px-2 flex items-center">
        <EditableField
          player={player}
          col={col}
          draftMap={draftMap}
          handleDraftChange={handleDraftChange}
          className={`w-full h-9 border-2 border-black bg-background text-sm text-foreground
            rounded-none px-2 shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:outline-none
            ${col.align === "center" ? "text-center ml-4.5" : "text-left"}
          `}
        />
      </div>
    )
  }

  const renderMobileField = (player, col) => {
    if (!editMode) {
      return col.key === "birthday"
        ? helper.formatDate(player[col.key])
        : player[col.key]
    }

    const isFullWidth =
      col.key === "name" || col.key === "birthday"

    const widthClass = isFullWidth ? "w-full" : "w-24"

    return (
      <EditableField
        player={player}
        col={col}
        draftMap={draftMap}
        handleDraftChange={handleDraftChange}
        className={`h-11 border-2 border-black bg-background text-sm text-foreground
          rounded-none px-2 shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:outline-none
          ${widthClass}
        `}
      />
    )
  }


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

          {/* Edit mode toggle */}
          <button
            type="button"
            onClick={toggleEditMode}
            className={`relative h-11 w-11 sm:h-9 sm:w-9 shrink-0 flex items-center justify-center border-2 border-black rounded-none
              shadow-[2px_2px_0_0_rgba(0,0,0,1)]
              active:shadow-none active:translate-x-[2px] active:translate-y-[2px]
              transition-all
              ${editMode ? "bg-emerald-400 text-accent-foreground" : "bg-background text-foreground hover:bg-muted"}
            `}
          >
            {editMode ? (
              <Check className="size-5 sm:size-4 text-black" />
            ) : (
              <Pencil className="size-5 sm:size-4 text-muted-foreground" />
            )}
          </button>

          {/* Filter/sort trigger */}
          <div className="relative shrink-0">
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
                className={`size-5 sm:size-4 ${sortKey ? "text-white" : "text-muted-foreground"
                  }`}
              />
              {sortKey && (
                <span className="absolute -top-1.5 -right-1.5 size-2.5 rounded-full bg-accent border border-black" />
              )}
            </button>

            {filterOpen && (
              <Filter sortKey={sortKey} toggleSortColumn={toggleSortColumn} flipDirection={flipDirection} sortDirection={sortDirection} />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Mobile: card list */}
          <div className="sm:hidden divide-y divide-black">
            {visiblePlayers.length > 0 ? (
              visiblePlayers.map((p) => (
                <div key={p.id} className={`p-4 bg-background active:bg-muted ${editMode ? "space-y-3" : ""}`}>
                  <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 items-center">
                    {/* Name */}
                    <div className="min-w-0 text-foreground">
                      {renderMobileField(p, MEMBER_FIELDS[0])}
                    </div>
                    {/* Rank */}
                    <div className="text-xs tracking-widest text-muted-foreground text-right">
                      {!editMode && "RANK: "}
                      {renderMobileField(p, MEMBER_FIELDS[1])}
                    </div>

                    {/* Birthday */}
                    <div className="min-w-0 text-sm text-muted-foreground">
                      {renderMobileField(p, MEMBER_FIELDS[2])}
                    </div>
                    {/* Gender */}
                    <div className="text-sm text-muted-foreground text-right">
                      {renderMobileField(p, MEMBER_FIELDS[3])}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8 px-4">
                No members match "{query}"
              </div>
            )}
          </div>

          {/* Desktop: table with bulk edit mode */}
          <Table className="hidden sm:table border-none shadow-none">
            <Table.Header className="sticky top-0 z-10 border-b-2 border-black">
              <Table.Row className="bg-card font-sans hover:bg-card">
                {MEMBER_FIELDS.map((col) => (
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
            <Table.Body>
              {visiblePlayers.length > 0 ? (
                visiblePlayers.map((p) => (
                  <Table.Row
                    key={p.id}
                    className="border-b border-black hover:bg-muted bg-background"
                  >
                    {MEMBER_FIELDS.map((col) => (
                      <Table.Cell
                        key={col.key}
                        className={`text-foreground px-5 ${col.align === "center" ? "text-center" : "text-left"}`}
                      >
                        {renderDesktopField(p, col)}
                      </Table.Cell>
                    ))}
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