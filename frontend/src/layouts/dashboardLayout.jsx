import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { TopBar } from '../components/TopBar'

export const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="flex bg-slate-50 text-slate-950 dark:bg-[#090A0B] dark:text-[#F7F8F8]" style={{ height: '100dvh', overflow: 'hidden' }}>
      <Sidebar
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex flex-col flex-1 min-w-0" style={{ height: '100dvh', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
        <div className='flex-1 overflow-auto px-3.5 py-5 md:px-5 lg:px-8 bg-slate-50 dark:bg-[#090A0B]'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
