import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { TopBar } from '../components/TopBar'

export const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex" style={{ height: '100dvh', overflow: 'hidden' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0" style={{ height: '100dvh', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
        <div className='flex-1 overflow-auto px-4 md:px-6 lg:px-10 py-6 bg-gray-50 dark:bg-[#18181B]'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
