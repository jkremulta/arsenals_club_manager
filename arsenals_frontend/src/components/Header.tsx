import { Menu } from '@/components/retroui/Menu'
import { Dialog } from "@/components/retroui/Dialog"
import { Button } from '@/components/retroui/Button'
import { Text } from "@/components/retroui/Text"
import { Loader2 } from 'lucide-react'
import { useUIStore } from '@/stores/useUIStore'
import { useLoginStore } from '@/stores/useLoginStore'
import helper from '../utils/helper'
import arsenalsLogo from './icons/arsenals logo transparent.png'
import MembersTab from './members/MembersTab'



function Header({ dashboardQuery, training, createTrainingMutation, endTrainingMutation, handleCreateTraining }) {

  const { createSessionOpen, setCreateSessionOpen, endSessionOpen, setEndSessionOpen, setMembersTabOpen, startTime, setStartTime } = useUIStore()
  const { logout } = useLoginStore()

  const dashboardLoading = dashboardQuery.isLoading

  const sessionLoading = createTrainingMutation.isPending || endTrainingMutation.isPending

  return (
    <>
      <header className="flex-shrink-0 border-black border-b-2 px-4 py-3 md:px-8 md:py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center">
              <img src={arsenalsLogo} alt="Arsenals logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <Text as="h6" className="text-sm md:text-base">Arsenal Tchoukball Club</Text>
              <p className="text-[11px] text-muted-foreground/60">
                Session ·{' '}
                {dashboardLoading ? (
                  <span className="inline-flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin text-muted-foreground/50" />
                    Checking…
                  </span>
                ) : training?.startTime ? (
                  helper.formatTime(training.startTime)
                ) : (
                  'N/A'
                )}
              </p>
            </div>
          </div>

          {/* Desktop controls */}
          <div className="hidden items-center gap-3 md:flex">
            {dashboardLoading ? (
              <Button size="sm" disabled className="font-sans border-2 border-black pointer-events-none bg-card text-muted-foreground shadow-none disabled:opacity-100">
                <Loader2 size={13} className="mr-1.5 animate-spin" />
                Checking session…
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  className="font-sans bg-emerald-400 text-black border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-emerald-300"
                  onClick={() => setCreateSessionOpen(true)}
                  style={{ display: training ? 'none' : undefined }}
                >
                  Start Session
                </Button>
                <Button
                  size="sm"
                  className="font-sans bg-red-400 text-black border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                  onClick={() => setEndSessionOpen(true)}
                  style={{ display: !training ? 'none' : undefined }}
                >
                  End Session
                </Button>
              </>
            )}
            <Menu>
              <Menu.Trigger className="px-3 py-1 text-sm shadow hover:shadow-sm font-sans bg-card border-2 border-black text-xs text-muted-foreground hover:bg-accent hover:text-foreground shadow-md hover:shadow active:shadow-none border-2 border-black transition hover:translate-y-1 active:translate-y-2 active:translate-x-1 hover:bg-primary-hover">
                Settings
              </Menu.Trigger>
              <Menu.Content className="min-w-36 mt-2 border-2 bg-card border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                <Menu.Item onClick={() => setMembersTabOpen(true)} className="text-muted-foreground hover:text-white flex items-center gap-2 text-[13px]">Members Tab</Menu.Item>
              </Menu.Content>
            </Menu>
            <Button
              size="sm"
              onClick={logout}
              className="font-sans bg-card border-2 border-black text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Logout
            </Button>
          </div>

          {/* Mobile menu */}
          <div className="flex items-center md:hidden">
            <Menu>
              <Menu.Trigger className="transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex flex-col gap-1 p-2.5 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] bg-card">
                <span className="block h-[1.5px] w-[20px] bg-foreground/60" />
                <span className="block h-[1.5px] w-[20px] bg-foreground/60" />
                <span className="block h-[1.5px] w-[20px] bg-foreground/60" />
              </Menu.Trigger>
              <Menu.Content align='center' className="min-w-36 mt-2 border-2 bg-card border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">

                {dashboardLoading ? (
                  <Menu.Item disabled className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    <Loader2 size={13} className="animate-spin" />
                    Checking session…
                  </Menu.Item>
                ) : !training ? (
                  <Menu.Item
                    onClick={() => setCreateSessionOpen(true)}
                    className="flex items-center gap-2 text-[13px] text-muted-foreground hover:!bg-emerald-400 hover:text-black"
                  >
                    Start Session
                  </Menu.Item>
                ) : (
                  <Menu.Item
                    onClick={() => setEndSessionOpen(true)}
                    className="flex items-center gap-2 py-3 text-[13px] text-muted-foreground hover:!bg-red-400 hover:text-black"
                  >
                    End Session
                  </Menu.Item>
                )}

                <div>
                  <Menu.Item onClick={() => setMembersTabOpen(true)} className="text-muted-foreground hover:text-white flex items-center gap-2 text-[13px]">Members Tab</Menu.Item>
                  <Menu.Item onClick={logout} className="py-3 text-muted-foreground flex items-center gap-2 text-[13px] hover:text-white">
                    Logout
                  </Menu.Item>
                </div>

              </Menu.Content>
            </Menu>

          </div>

        </div>
      </header>
      {/* Single shared dialogs */}
      <Dialog open={createSessionOpen} onOpenChange={setCreateSessionOpen}>
        <Dialog.Content className="bg-card border-2 border-black w-[90vw] max-w-[420px]">
          <Dialog.Header className="border-b-2 border-black bg-emerald-400 px-4 py-3">
            <p className="font-head text-black">Start Training Session</p>
          </Dialog.Header>
          <section className="flex flex-col gap-5 p-4">
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-sm border-2 border-black bg-card px-3 py-2 text-foreground outline-none"
              />
            </div>
            <div className="flex w-full justify-end">
              <Button
                onClick={handleCreateTraining}
                disabled={sessionLoading}
                className="bg-emerald-400 text-black hover:bg-emerald-300 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] disabled:opacity-50"
              >
                {sessionLoading && <Loader2 size={14} className="mr-2 animate-spin" />}
                Confirm
              </Button>
            </div>
          </section>
        </Dialog.Content>
      </Dialog>

      <Dialog open={endSessionOpen} onOpenChange={setEndSessionOpen}>
        <Dialog.Content className="bg-card border-2 border-black w-[90vw] max-w-[420px]">
          <Dialog.Header className="border-b-2 border-black bg-red-400 px-4 py-3">
            <p className="font-head text-black">End Training Session</p>
          </Dialog.Header>
          <section className="flex flex-col gap-5 p-4">
            <p className="text-muted-foreground text-sm">
              This will reset all game counts and delete the active session. This cannot be undone.
            </p>
            <div className="flex w-full justify-end">
              <Button
                onClick={() => endTrainingMutation.mutate()}
                disabled={sessionLoading}
                className="bg-red-400 text-black border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] disabled:opacity-50"
              >
                {sessionLoading && <Loader2 size={14} className="mr-2 animate-spin" />}
                End
              </Button>
            </div>
          </section>
        </Dialog.Content>
      </Dialog>

      {/* dialog for members  */}
      <MembersTab />
    </>

  )
}

export default Header