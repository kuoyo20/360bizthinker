import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { ResetDialog } from './ResetDialog'
import { useStore } from '@/store/useStore'

export function Layout() {
  const m4Progress = useStore((s) => s.getM4Completion())
  const reset = useStore((s) => s.reset)
  const [resetOpen, setResetOpen] = useState(false)

  const handleExport = () => {
    const state = useStore.getState().exportState()
    const json = JSON.stringify(state, null, 2)
    // eslint-disable-next-line no-console
    console.log('[銷售軍師] 匯出 — Phase 5 將實作真 PDF\n' + json)
    alert(
      '已將完整資料輸出到瀏覽器 console(F12 → Console 分頁)。\n' +
        'Phase 5 會接 PDF 匯出。'
    )
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar
        m4Progress={m4Progress}
        onExport={handleExport}
        onReset={() => setResetOpen(true)}
      />
      <main className="flex-1 min-w-0 overflow-x-auto">
        <Outlet />
      </main>
      <ResetDialog open={resetOpen} onOpenChange={setResetOpen} onConfirm={reset} />
    </div>
  )
}
