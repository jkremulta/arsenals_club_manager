function StatCard({ icon: Icon, label, value, accent, valueStyle }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 md:px-4 md:py-3">
      <div
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: `${accent}22`, color: accent }}
      >
        <Icon size={13} />
      </div>
      <div>
        <p className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground md:text-[10px]">
          {label}
        </p>
        <p className="text-[15px] font-semibold leading-tight text-foreground md:text-[17px]" style={valueStyle}>
          {value}
        </p>
      </div>
    </div>
  )
}

export default StatCard