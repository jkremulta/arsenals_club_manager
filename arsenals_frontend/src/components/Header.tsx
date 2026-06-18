import { useUIStore } from '@/stores/useUIStore'
import { Button } from '@/components/retroui/Button'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Dialog } from "@/components/retroui/Dialog";
import { Text } from "@/components/retroui/Text";
import helper from '../utils/helper'
import arsenalsLogo from './icons/arsenals logo transparent.png'
import { useLoginStore } from '@/stores/useLoginStore'

function Header({ dashboardQuery, training, createTrainingMutation, endTrainingMutation, handleCreateTraining }) {

  const { createSessionOpen, setCreateSessionOpen, endSessionOpen, setEndSessionOpen, startTime, setStartTime, setDrawerOpen } = useUIStore()
  const { logout } = useLoginStore()

  const navigate = useNavigate()

  const dashboardLoading = dashboardQuery.isLoading
  const sessionLoading = createTrainingMutation.isPending || endTrainingMutation.isPending

  return (
    <header className="flex-shrink-0 border-solid border-black border-2 px-4 py-3 md:px-8 md:py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center">
            <img src={arsenalsLogo} alt="Arsenals logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <Text as="h6">Arsenal Tchoukball Club</Text>
            <p className="text-muted-foreground/60 md:text-[11px]">
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
            <Button
              size="sm"
              variant="secondary"
              disabled
              className="font-sans pointer-events-none border-border bg-card text-muted-foreground shadow-none disabled:opacity-100"
            >
              <Loader2 size={13} className="mr-1.5 animate-spin" />
              Checking session…
            </Button>
          ) : (
            <>
              <Dialog open={createSessionOpen} onOpenChange={setCreateSessionOpen}>
                <Button
                  size="sm"
                  className="bg-emerald-600 text-white hover:bg-emerald-500 font-sans"
                  onClick={() => setCreateSessionOpen(true)}
                  style={{ display: training ? 'none' : undefined }}
                >
                  Start Session
                </Button>
                <Dialog.Content className="border-2 border-black w-[420px] max-w-[90vw]">
                  <Dialog.Header className='bg-emerald-600 text-white'>
                    <Text as='h4'>Start training session?</Text>
                  </Dialog.Header>
                  <section className="flex flex-col gap-5 p-4">
                    <section className="text-xl">
                      <label className="mb-1.5 block text-sm text-muted-foreground">Start Time</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full text-sm border border-input bg-background px-3 py-2 text-foreground outline-none focus:border-emerald-500/50"
                      />
                    </section>
                    <section className="flex w-full justify-end">
                      <Button
                        onClick={handleCreateTraining}
                        disabled={sessionLoading}
                        className="text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
                      >
                        {sessionLoading && <Loader2 size={14} className="mr-2 animate-spin" />}
                        Confirm
                      </Button>
                    </section>
                  </section>
                </Dialog.Content>
              </Dialog>

              <Dialog open={endSessionOpen} onOpenChange={setEndSessionOpen}>
                <Button
                  size="sm"
                  className="font-sans bg-background text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  onClick={() => setEndSessionOpen(true)}
                  style={{ display: !training ? 'none' : undefined }}
                >
                  End Session
                </Button>
                <Dialog.Content className="border-none w-[420px] max-w-[90vw]">
                  <Dialog.Header className='bg-red-600 border-2 border-black text-white'>
                    <Text as="h4">End training session?</Text>
                  </Dialog.Header>
                  <section className="border-2 border-black flex flex-col gap-5 p-4">
                    <p className="text-muted-foreground">
                      This will reset all game counts and delete the active session. This cannot be undone.
                    </p>
                    <section className="flex w-full justify-end gap-2">
                      <Button
                        onClick={() => endTrainingMutation.mutate()}
                        disabled={sessionLoading}
                        className="bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
                      >
                        {sessionLoading && <Loader2 size={14} className="mr-2 animate-spin" />}
                        End
                      </Button>
                    </section>
                  </section>
                </Dialog.Content>
              </Dialog>
            </>
          )}
          <Button
            size="sm"
            onClick={() => navigate('/members')}
            className="font-sans bg-background border-2 border-black text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            Members
          </Button>
          <Button
            size="sm"

            onClick={logout}
            className="font-sans bg-background border-2 border-black text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            Logout
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex flex-col gap-1 rounded p-2 hover:bg-card md:hidden"
          onClick={() => setDrawerOpen(true)}
        >
          <span className="block h-[1.5px] w-[18px] rounded bg-foreground/60" />
          <span className="block h-[1.5px] w-[18px] rounded bg-foreground/60" />
          <span className="block h-[1.5px] w-[18px] rounded bg-foreground/60" />
        </button>
      </div>
    </header>
  )
}

export default Header