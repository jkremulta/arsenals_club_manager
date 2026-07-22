import { House } from "lucide-react"
import { Link } from "react-router-dom"

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center flex-col gap-3">
      <h1 className="font-head text-foreground">404 - Not Found</h1>
      <p className="text-muted-foreground text-s">The page you're looking for does not exist</p>
      <Link to={"/"}
        className="flex items-center gap-1 text-s text-muted-foreground hover:underline"
      >
        <House size={16} />
        Go back home
      </Link>
    </div>
  )
}

export default NotFound