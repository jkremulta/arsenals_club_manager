import { Loader2 } from 'lucide-react'

const DashboardLoading = () => {
  return (
    <>
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex w-full max-w-sm flex-col items-center border-2 border-dashed py-16 text-center">
          <Loader2
            size={30}
            className="mb-3 animate-spin text-muted-foreground/40"
          />
          <p className="text-sm font-medium text-muted-foreground">
            Loading dashboard
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Checking training session state...
          </p>
        </div>
      </div>
    </>
  )
}

export default DashboardLoading