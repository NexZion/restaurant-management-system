import { useState } from 'react'

export const Accordion = ({
  items = [], // Array of {title, content}
  allowMultiple = false, // true = multiple items can be open, false = only one at a time
  iconPosition = 'right', // 'left' or 'right'
  openIcon = null, // Custom icon for open state
  closeIcon = null, // Custom icon for closed state
  defaultExpanded = [], // Array of indices to be expanded by default
  groupTitle = '', // Optional group title
  variant = 'outlined', // 'outlined', 'filled', 'standard'
}) => {
  const [expandedItems, setExpandedItems] = useState(defaultExpanded)

  // Default icons
  const defaultOpenIcon = (
    <svg className="w-5 h-5 text-gray-600 dark:text-[#8A8F98]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  )

  const defaultCloseIcon = (
    <svg className="w-5 h-5 text-gray-600 dark:text-[#8A8F98]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )

  const handleToggle = (index) => {
    if (allowMultiple) {
      // Multiple items can be open
      setExpandedItems(prev =>
        prev.includes(index)
          ? prev.filter(i => i !== index)
          : [...prev, index]
      )
    } else {
      // Only one item can be open at a time
      setExpandedItems(prev =>
        prev.includes(index) ? [] : [index]
      )
    }
  }

  const variantStyles = {
    outlined: {
      container: 'overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-[#1F2226] dark:bg-[#121314]',
      item: 'border-b border-slate-100 last:border-b-0 dark:border-[#1F2226]',
      header: 'hover:bg-slate-50 dark:bg-transparent dark:hover:bg-[#1A1C20]/60',
      content: 'bg-white dark:bg-[#121314]'
    },
    filled: {
      container: '',
      item: 'mb-2 last:mb-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-[#1F2226] dark:bg-[#121314]',
      header: 'hover:bg-slate-50 dark:bg-transparent dark:hover:bg-[#1A1C20]/60',
      content: 'bg-white dark:bg-[#121314]'
    },
    standard: {
      container: '',
      item: 'mb-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-[#1F2226] dark:bg-[#121314]',
      header: 'hover:bg-slate-50 dark:bg-transparent dark:hover:bg-[#1A1C20]/60',
      content: 'bg-white dark:bg-[#121314]'
    }
  }

  const styles = variantStyles[variant]

  return (
    <div className="flex flex-col gap-2">
      {/* Group Title */}
      {groupTitle && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F7F8F8] mb-2">
          {groupTitle}
        </h3>
      )}

      {/* Accordion Items */}
      <div className={styles.container}>
        {items.map((item, index) => {
          const isExpanded = expandedItems.includes(index)
          const icon = isExpanded ? (openIcon || defaultOpenIcon) : (closeIcon || defaultCloseIcon)

          return (
            <div key={index} className={styles.item}>
              {/* Header */}
              <button
                type='button'
                onClick={() => handleToggle(index)}
                disabled={item.disabled}
                className={`
                  w-full px-3.5 py-2.5 flex items-center justify-between gap-2.5 text-left transition-colors
                  ${styles.header}
                  ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {/* Icon on Left */}
                {iconPosition === 'left' && (
                  <div className="flex-shrink-0 transition-transform duration-300">
                    {icon}
                  </div>
                )}

                {/* Title */}
                <div className="flex-1 text-sm font-semibold text-slate-950 dark:text-[#F7F8F8]">
                  {item.title}
                </div>

                {/* Icon on Right */}
                {iconPosition === 'right' && (
                  <div className="flex-shrink-0 transition-transform duration-300">
                    {icon}
                  </div>
                )}
              </button>

              {/* Content */}
              <div 
                className={`
                  overflow-hidden transition-all duration-300 ease-in-out 
                  ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}
                `}
              >
                <div className={`${styles.content} px-2.5 py-3.5 text-sm text-slate-700 dark:text-[#D0D6E0] sm:px-5 sm:py-5`}>
                  {item.content}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Accordion Item component (for more control)
export const AccordionItem = ({
  title,
  content,
  isExpanded,
  onToggle,
  disabled = false,
  iconPosition = 'right',
  openIcon,
  closeIcon
}) => {
  const defaultOpenIcon = (
    <svg className="w-5 h-5 text-gray-600 dark:text-[#8A8F98]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  )

  const defaultCloseIcon = (
    <svg className="w-5 h-5 text-gray-600 dark:text-[#8A8F98]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )

  const icon = isExpanded ? (openIcon || defaultOpenIcon) : (closeIcon || defaultCloseIcon)

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-[#1F2226] dark:bg-[#121314]">
      <button
        type='button'
        onClick={onToggle}
        disabled={disabled}
        className={`
          w-full px-3.5 py-2.5 flex items-center justify-between gap-2.5 text-left transition-colors
          hover:bg-slate-50 dark:bg-transparent dark:hover:bg-[#1A1C20]/60
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {iconPosition === 'left' && (
          <div className="flex-shrink-0 transition-transform duration-300">
            {icon}
          </div>
        )}

        <div className="flex-1 text-sm font-semibold text-slate-950 dark:text-[#F7F8F8]">
          {title}
        </div>

        {iconPosition === 'right' && (
          <div className="flex-shrink-0 transition-transform duration-300">
            {icon}
          </div>
        )}
      </button>

      <div 
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="bg-white px-3.5 py-2.5 text-sm text-slate-700 dark:bg-[#121314] dark:text-[#D0D6E0]">
          {content}
        </div>
      </div>
    </div>
  )
}
