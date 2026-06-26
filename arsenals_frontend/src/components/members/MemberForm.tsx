import { Select } from '@/components/retroui/Select'
import { Dialog } from "@/components/retroui/Dialog"
import { useUIStore } from '@/stores/useUIStore'
import { Button } from '@/components/retroui/Button'
import { useState } from 'react'
import { useMembers } from '@/hooks/useMembers'
import { useLoginStore } from '@/stores/useLoginStore'
import { Loader2 } from 'lucide-react'

const MemberForm = () => {
  const { user } = useLoginStore()
  const { handleSubmit, createPlayerMutation } = useMembers(user?.token)

  const [form, setForm] = useState({ name: '', rank: '', gender: '', birthday: '' })
  const resetForm = () => setForm({ name: '', rank: '', gender: '', birthday: '' })

  const { membersOpen, setMembersOpen } = useUIStore()


  const handleRegister = () => {
    handleSubmit({
      editingId: null,
      form,
      onSuccess: () => {
        resetForm()
        setMembersOpen(false)
      }
    })
  }

  const inputClass =
    'w-64 border-2 border-black bg-card px-3 py-2.5 text-sm text-foreground ' +
    'placeholder:text-muted-foreground/50 outline-none shadow-[2px_2px_0px_0px_#000] ' +
    'focus:shadow-[3px_3px_0px_0px_#000] transition-shadow'

  return (
    <Dialog open={membersOpen} onOpenChange={setMembersOpen}>
      <Dialog.Content className="bg-card border-2 border-black">
        <Dialog.Header className="border-b-2 border-black bg-emerald-400 px-4 py-3">
          <p className="font-head text-black">Add Member</p>
        </Dialog.Header>
        <section className="flex flex-col gap-4 p-4">
          <section className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col flex-1">
              <label className="text-[12px] text-muted-foreground p-1">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Juan Dela Cruz"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-[12px] text-muted-foreground p-1">Rank</label>
              <input
                type="number"
                value={form.rank}
                onChange={(e) => setForm(f => ({ ...f, rank: e.target.value }))}
                placeholder="6.7"
                min=".5"
                max="10"
                step=".5"
                className={inputClass}
              />
            </div>
          </section>
          <section className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col flex-1">
              <label className="text-[12px] text-muted-foreground p-1">Birthday</label>
              <input
                type="date"
                value={form.birthday}
                onChange={(e) => setForm(f => ({ ...f, birthday: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-[12px] text-muted-foreground p-1">Gender</label>
              <Select value={form.gender} onValueChange={(v) => setForm(f => ({ ...f, gender: v ?? '' }))}>
                <Select.Trigger className={`${inputClass} h-11`}>
                  <Select.Value placeholder="Select Gender" />
                </Select.Trigger>
                <Select.Content className="border-2 border-black text-sm">
                  <Select.Group>
                    <Select.Item className="capitalize data-[highlighted]:bg-white/10 data-[highlighted]:text-foreground" value="Male">Male</Select.Item>
                    <Select.Item className="capitalize data-[highlighted]:bg-white/10 data-[highlighted]:text-foreground" value="Female">Female</Select.Item>
                  </Select.Group>
                </Select.Content>
              </Select>
            </div>
          </section>
          <div className="flex w-full justify-end">
            <Button
              onClick={handleRegister}
              disabled={createPlayerMutation.isPending}
              className="bg-emerald-400 text-black border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] disabled:opacity-50"
            >
              {createPlayerMutation.isPending && <Loader2 size={14} className="mr-2 animate-spin" />}
              Add Member
            </Button>
          </div>
        </section>
      </Dialog.Content>
    </Dialog>
  )
}

export default MemberForm