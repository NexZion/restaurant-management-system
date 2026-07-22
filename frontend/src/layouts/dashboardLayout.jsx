import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { TopBar } from '../components/TopBar'

export const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex bg-slate-100 text-slate-950 dark:bg-[#0b0d12] dark:text-slate-50" style={{ height: '100dvh', overflow: 'hidden' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0" style={{ height: '100dvh', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
        <div className='flex-1 overflow-auto px-4 md:px-6 lg:px-10 py-6 bg-slate-100 dark:bg-[#0b0d12]'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
