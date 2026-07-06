import helper from "@/utils/helper"

const EditableField = ({
  player,
  col,
  draftMap,
  handleDraftChange,
  className,
}) => {
  const inputValue =
    draftMap[player.id]?.[col.key] ??
    (
      col.type === "date"
        ? player[col.key]
          ? helper.toIsoDate(player[col.key])
          : ""
        : player[col.key] ?? ""
    )

  if (col.type === "select") {
    return (
      <select
        value={inputValue}
        onChange={(e) => handleDraftChange(player, col, e.target.value)}
        className={className}
      >
        {col.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    )
  }

  return (
    <input
      type={col.type}
      step={col.step}
      value={inputValue}
      onChange={(e) => handleDraftChange(player, col, e.target.value)}
      className={className}
    />
  )
}

export default EditableField