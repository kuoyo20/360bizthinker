import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Overview } from '@/pages/Overview'
import { NotFound } from '@/pages/NotFound'
import { M3Empathy } from '@/modules/M3_Empathy'
import { M4Journey } from '@/modules/M4_Journey'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="/m3" element={<M3Empathy />} />
          <Route path="/m4" element={<M4Journey />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
