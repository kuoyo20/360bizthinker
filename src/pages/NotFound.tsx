import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFound() {
  return (
    <div className="px-10 py-12 max-w-2xl">
      <h1 className="font-serif text-3xl font-bold text-ink-primary">頁面不存在</h1>
      <p className="text-ink-secondary mt-2 mb-6">這個路徑沒有對應的模組,可能還沒實作或網址打錯了。</p>
      <Button asChild>
        <Link to="/">回到總覽</Link>
      </Button>
    </div>
  )
}
