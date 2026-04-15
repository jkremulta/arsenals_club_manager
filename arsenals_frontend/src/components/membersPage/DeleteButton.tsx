import { Loader2, Trash2 } from 'lucide-react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

function DeleteButton({ onConfirm, loading, disabled = false }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          disabled={loading || disabled}
          className="flex h-7 w-7 items-center justify-center rounded border border-red-500/20 bg-red-500/[0.06] text-red-400/60 hover:bg-red-500/[0.12] hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-500">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteButton