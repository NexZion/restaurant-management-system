
import { useState } from 'react'

// VerticalTabs component (original)
export const VerticalTabs = ({ tabs, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <div className='flex h-full gap-3.5'>
      {/* Vertical Tab Buttons */}
      <div className='flex min-w-62.5 flex-col gap-2 border-r border-slate-200 pr-4 dark:border-[#1F2226]'>
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`
              px-3.5 py-2.5 text-left text-sm font-medium rounded-lg
              transition-all duration-200
              ${activeTab === index
                ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100 dark:bg-[#5E6AD2]/15 dark:text-[#828FFF] dark:ring-[#5E6AD2]/30'
                : 'text-slate-700 hover:bg-slate-100 dark:bg-transparent dark:text-[#D0D6E0] dark:hover:bg-[#1A1C20] dark:hover:text-[#F7F8F8]'
              }
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            disabled={tab.disabled}
          >
            <div className='flex items-center gap-2.5'>
              {tab.icon && <span className='text-lg'>{tab.icon}</span>}
              <div className='flex-1'>
                <div className='font-semibold'>{tab.label}</div>
                {tab.description && (
                  <div className={`text-xs mt-0.5 ${activeTab === index ? 'text-blue-100 dark:text-[#F7F8F8]' : 'text-gray-500 dark:text-[#8A8F98]'}`}>
                    {tab.description}
                  </div>
                )}
              </div>
              {tab.badge && (
                <span className={`
                  px-2 py-0.5 text-xs rounded-full
                  ${activeTab === index 
                    ? 'bg-white text-blue-600 dark:bg-[#121314] dark:text-[#F7F8F8]'
                    : 'bg-gray-200 dark:bg-[#121314] text-gray-700 dark:text-slate-700'
                  }
                `}>
                  {tab.badge}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className='flex-1 overflow-auto'>
        {tabs[activeTab] && tabs[activeTab].content}
      </div>
    </div>
  )
}

/**
 * SectionDivider - Horizontal Tabs with Customization and Theme Support
 * @param {Object[]} tabs - Array of tab objects: { label, content, icon, badge, description, disabled }
 * @param {number} defaultTab - Index of the default active tab
 * @param {string} className - Extra classes for the wrapper
 * @param {string} tabClassName - Extra classes for each tab button
 * @param {string} contentClassName - Extra classes for the content area
 * @param {boolean} fullWidth - If true, tabs stretch to full width
 */
export const SectionDivider = ({
  tabs = [],
  defaultTab = 0,
  activeTab: controlledActiveTab,
  onTabChange,
  className = '',
  tabClassName = '',
  contentClassName = '',
  fullWidth = false,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab)
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab

  const setActiveTab = (index) => {
    if (tabs[index]?.disabled) return
    onTabChange?.(index)
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(index)
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Tab bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 sm:overflow-visible">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveTab(idx)}
            className={`rounded-t-lg border-b-2 px-3.5 py-2 text-sm font-semibold transition-all
              whitespace-nowrap shrink-0 sm:whitespace-normal sm:shrink
              ${activeTab === idx
                ? 'border-blue-600 bg-blue-50/70 text-blue-700 dark:border-[#5E6AD2] dark:bg-[#5E6AD2]/10 dark:text-[#828FFF]'
                : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:border-transparent dark:bg-transparent dark:text-[#8A8F98] dark:hover:bg-[#1A1C20] dark:hover:text-[#F7F8F8]'}
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${tabClassName}`}
            disabled={tab.disabled}
            aria-selected={activeTab === idx}
            aria-controls={`section-tabpanel-${idx}`}
            id={`section-tab-${idx}`}
            tabIndex={tab.disabled ? -1 : 0}
          >
            <div className="flex items-center gap-2">
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`ml-1.5 rounded-full px-2 py-0.5 text-xs ${activeTab === idx ? 'bg-blue-100 text-blue-700 dark:bg-[#161719] dark:text-[#F7F8F8]' : 'bg-slate-100 text-slate-700 dark:bg-[#161719] dark:text-[#D0D6E0]'}`}>
                  {tab.badge}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div
        className={`mt-4 sm:mt-5 ${contentClassName}`}
        id={`section-tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`section-tab-${activeTab}`}
      >
        {tabs[activeTab] && tabs[activeTab].content}
      </div>
    </div>
  )
}
