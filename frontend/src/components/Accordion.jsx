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
    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  )

  const defaultCloseIcon = (
    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      container: 'border border-gray-300 dark:border-gray-600 rounded',
      item: 'border-b border-gray-300 dark:border-gray-600 last:border-b-0',
      header: 'hover:bg-gray-50 dark:hover:bg-[#212125]'
    },
    filled: {
      container: 'rounded',
      item: 'mb-2 last:mb-0',
      header: 'bg-gray-50 dark:bg-[#212125] hover:bg-gray-100 dark:hover:bg-gray-700 rounded'
    },
    standard: {
      container: '',
      item: 'border border-gray-300 dark:border-gray-600 rounded mb-4',
      header: 'hover:bg-gray-50 dark:hover:bg-[#212125]'
    }
  }

  const styles = variantStyles[variant]

  return (
    <div className="flex flex-col gap-2">
      {/* Group Title */}
      {groupTitle && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
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
                  w-full px-4 py-3 flex items-center justify-between gap-3 text-left transition-colors
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
                <div className="flex-1 text-md font-semibold text-gray-900 dark:text-white">
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
                <div className="sm:px-6 sm:py-6 px-2 py-4 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-[#18181B]">
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
    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  )

  const defaultCloseIcon = (
    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )

  const icon = isExpanded ? (openIcon || defaultOpenIcon) : (closeIcon || defaultCloseIcon)

  return (
    <div className="border-b border-gray-300 dark:border-gray-600 last:border-b-0">
      <button
        type='button'
        onClick={onToggle}
        disabled={disabled}
        className={`
          w-full px-4 py-3 flex items-center justify-between gap-3 text-left transition-colors
          hover:bg-gray-50 dark:hover:bg-[#212125]
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {iconPosition === 'left' && (
          <div className="flex-shrink-0 transition-transform duration-300">
            {icon}
          </div>
        )}

        <div className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
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
        <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-[#18181B]">
          {content}
        </div>
      </div>
    </div>
  )
}
