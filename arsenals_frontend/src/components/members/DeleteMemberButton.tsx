import { useState } from "react";
import { Check, X, Trash2, Loader2 } from "lucide-react";
import { Button } from "../retroui/Button";

const DeleteMemberButton = ({ player, handleDelete, deletePlayerMutation, size = "size-8" }) => {
  const [confirming, setConfirming] = useState(false)
  const deletePlayerLoading =
    deletePlayerMutation.isPending && deletePlayerMutation.variables === player.id

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="icon"
          onClick={() => {
            handleDelete(player.id)
            setConfirming(false)
          }}
          className={`${size} shrink-0 flex items-center justify-center border-2 border-black rounded-none
            bg-emerald-400 text-white
            shadow-[2px_2px_0_0_rgba(0,0,0,1)]`}
          title="Confirm delete"
        >
          <Check className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          onClick={() => setConfirming(false)}
          className={`${size} shrink-0 flex items-center justify-center border-2 border-black rounded-none
            bg-card text-white
            shadow-[2px_2px_0_0_rgba(0,0,0,1)]`}
        >
          <X className="size-4" />
        </Button>
      </div>
    )
  }

  return (
    <Button
      type="button"
      size="icon"
      onClick={() => setConfirming(true)}
      disabled={deletePlayerLoading}
      className={`${size} shrink-0 border-2 border-black rounded-none
        bg-card text-muted-foreground hover:bg-red-400 hover:text-white
        shadow-[2px_2px_0_0_rgba(0,0,0,1)]
        active:shadow-none active:translate-x-[2px] active:translate-y-[2px]
        transition-all disabled:opacity-50`}
    >
      {deletePlayerLoading ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </Button>
  )
}

export default DeleteMemberButton