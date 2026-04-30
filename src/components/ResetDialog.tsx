import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ResetDialog({ open, onOpenChange, onConfirm }: Props) {
  const [busy, setBusy] = useState(false)

  const handleConfirm = () => {
    setBusy(true)
    onConfirm()
    setTimeout(() => {
      setBusy(false)
      onOpenChange(false)
    }, 100)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>確定要重置所有資料嗎?</DialogTitle>
          <DialogDescription>
            此動作會清空 4 個模組的所有填寫內容,且無法復原。localStorage 也會一併清掉。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            取消
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={busy}>
            確定清空
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
