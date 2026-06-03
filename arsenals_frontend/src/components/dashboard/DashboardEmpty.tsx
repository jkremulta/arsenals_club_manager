import { AlertCircle } from 'lucide-react'

const DashboardEmpty = () => {
  return (
    <>
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex w-full max-w-sm flex-col items-center rounded-xl border border-dashed border-border py-16 text-center">
          <AlertCircle
            size={30}
            className="mb-3 text-muted-foreground/40"
          />
          <p className="text-sm font-medium text-muted-foreground">
             No active training session
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Open the menu to start a session
          </p>
        </div>
      </div>
    </>
  )
}

export default DashboardEmpty