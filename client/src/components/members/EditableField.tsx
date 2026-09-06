import helper from "@/utils/helper"

const EditableField = ({
  user,
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

  const isDisabled =
    user?.username === "arsenals" && col.key === "rank"

  if (col.type === "select") {
    return (
      <select
        disabled={isDisabled}
        value={inputValue}
        onChange={(e) => handleDraftChange(player, col, e.target.value)}
        className={`${className} capitalize`}
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
      disabled={isDisabled}
      type={col.type}
      step={col.step}
      value={inputValue}
      onChange={(e) => handleDraftChange(player, col, e.target.value)}
      className={className}
    />
  )
}

export default EditableField