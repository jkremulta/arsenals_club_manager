import { Card } from "@/components/retroui/Card";

function StatCard({ icon: Icon, label, value, accent, valueStyle }) {
  return (
    <Card className="shadow-none px-3 py-2.5 md:px-4 md:py-3 border-2 border-black">
      <Card.Header className="flex flex-row items-center gap-3 space-y-0 p-0">
        <div
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center border-2 border-black"
          style={{ backgroundColor: accent, color: '#1a2d4d' }}
        >
          <Icon size={13} />
        </div>
        <div>
          <Card.Description className="text-[9px] font-medium uppercase tracking-widest md:text-[10px]">
            {label}
          </Card.Description>
          <Card.Title
            className="text-[15px] leading-tight md:text-[17px]"
            style={valueStyle}
          >
            {value}
          </Card.Title>
        </div>
      </Card.Header>
    </Card>
  );
}

export default StatCard;