import { useEffect, useState } from 'react'

export const Alert = ({
  type = 'info', // 'success', 'error', 'warning', 'info'
  message = '',
  position = 'top', // 'top' or 'bottom'
  isOpen = false,
  onClose = null,
  autoClose = true,
  duration = 5000, // Auto close after 5 seconds
  icon = null, // Custom icon (will use default if not provided)
  showCloseButton = true
}) => {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      // Delay to allow mounting before animation
      const timer = setTimeout(() => {
        setVisible(true)
      }, 50)
      
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
      // Delay unmounting until animation completes
      const timer = setTimeout(() => {
        setMounted(false)
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [isOpen, autoClose, duration])

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => {
      onClose?.()
    }, 500)
  }

  if (!mounted) return null

  // Default icons for each type
  const defaultIcons = {
    success: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    )
  }

  // Color schemes for each type (light and dark mode)
  const typeStyles = {
    success: {
      light: 'bg-green-50 border-green-500 text-green-900',
      dark: 'dark:bg-[#1a2e1a] dark:border-green-500 dark:text-green-200',
      icon: 'text-green-600 dark:text-green-400'
    },
    error: {
      light: 'bg-red-50 border-red-500 text-red-900',
      dark: 'dark:bg-[#2e1a1a] dark:border-red-500 dark:text-red-200',
      icon: 'text-red-600 dark:text-red-400'
    },
    warning: {
      light: 'bg-yellow-50 border-yellow-500 text-yellow-900',
      dark: 'dark:bg-[#2e2a1a] dark:border-yellow-500 dark:text-yellow-200',
      icon: 'text-yellow-600 dark:text-yellow-400'
    },
    info: {
      light: 'bg-blue-50 border-blue-500 text-blue-900',
      dark: 'dark:bg-[#1a232e] dark:border-blue-500 dark:text-blue-200',
      icon: 'text-blue-600 dark:text-blue-400'
    }
  }

  const styles = typeStyles[type]
  const displayIcon = icon || defaultIcons[type]

  return (
    <div 
      className={`
        fixed left-1/2 -translate-x-1/2 z-50 
        transition-all duration-500 ease-out
        ${visible ? 'opacity-100' : 'opacity-0'}
      `}
      style={{
        [position === 'top' ? 'top' : 'bottom']: visible ? '1rem' : '-6rem'
      }}
    >
      <div 
        className={`
          min-w-[320px] max-w-md px-4 py-3 rounded-xl border shadow-2xl backdrop-blur
          flex items-start gap-3
          ${styles.light} ${styles.dark}
        `}
      >
        {/* Icon */}
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {displayIcon}
        </div>

        {/* Message */}
        <div className="flex-1 text-sm font-medium">
          {message}
        </div>

        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={handleClose}
            className={`
              flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors
              ${styles.icon}
            `}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

// Toast notification system (for multiple alerts)
export const useToast = () => {
  const [toasts, setToasts] = useState([])

  const showToast = ({ type, message, duration = 5000, position = 'top' }) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, type, message, duration, position }])

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, duration)
  }

  const ToastContainer = () => (
    <>
      {toasts.map(toast => (
        <Alert
          key={toast.id}
          type={toast.type}
          message={toast.message}
          position={toast.position}
          isOpen={true}
          duration={toast.duration}
          onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
        />
      ))}
    </>
  )

  return { showToast, ToastContainer }
}

// Dialog Modal Component
export const Dialog = ({
  isOpen = false,
  onClose = null,
  title = '',
  children,
  showHeader = true,
  showFooter = true,
  onPrimaryButtonClick = null,
  onSecondaryButtonClick = null,
  primaryButtonText = 'Submit',
  secondaryButtonText = 'Cancel',
  size = 'medium', // 'small', 'medium', 'large'
  showCloseButton = true,
  showPrimaryButton = true,
  showSecondaryButton = true,
  primaryButtonDisabled = false,
  secondaryButtonDisabled = false,
}) => {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      document.body.style.overflow = 'hidden' // Prevent page scroll
      setTimeout(() => {
        setVisible(true)
      }, 10)
    } else {
      setVisible(false)
      document.body.style.overflow = '' // Restore page scroll
      setTimeout(() => {
        setMounted(false)
      }, 300)
    }

    return () => {
      document.body.style.overflow = '' // Cleanup
    }
  }, [isOpen])

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => {
      onClose?.()
    }, 300)
  }

  const handleSecondaryButtonClick = () => {
    onSecondaryButtonClick ? onSecondaryButtonClick() : handleClose()
  }

  const handlePrimaryButtonClick = () => {
    onPrimaryButtonClick?.()
  }

  const sizeClasses = {
    extrasmall: 'max-w-xs',
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    extralarge: 'max-w-6xl'
  }

  if (!mounted) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm transition-opacity duration-300 dark:bg-[#0b0d12]/75
          ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`
            ${sizeClasses[size]} w-full rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 dark:border-[#252a35] dark:bg-[#111318] dark:shadow-black/50
            flex flex-col max-h-[90vh] pointer-events-auto
            transition-all duration-300 ease-out
            ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {showHeader && (
            <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-[#252a35]">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                {title}
              </h2>
              {showCloseButton && (
                <button
                  onClick={handleClose}
                  className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-5 text-slate-900 dark:text-white">
            {children}

            {/* Footer */}
            {showFooter && (
              <div className="-mx-6 -mb-5 mt-5 flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-[#252a35] dark:bg-[#171a21]">
              {showSecondaryButton && (
                <button
                  onClick={handleSecondaryButtonClick}
                  disabled={secondaryButtonDisabled}
                  className="inline-flex min-h-10 min-w-28 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#252a35] dark:bg-[#111318] dark:text-white dark:hover:bg-[#1f2430]"
                >
                  {secondaryButtonText}
                </button>)
              }
              {showPrimaryButton && (
                <button
                  onClick={handlePrimaryButtonClick}
                  disabled={primaryButtonDisabled}
                  className="inline-flex min-h-10 min-w-28 items-center justify-center rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600 dark:border-blue-400 dark:bg-blue-500 dark:hover:bg-blue-400"
                >
                  {primaryButtonText}
                </button>)
              }
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// Snackbar Component
export const Snackbar = ({
  message = '',
  position = 'bottom-left', // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
  isOpen = false,
  onClose = null,
  autoClose = true,
  duration = 5000,
  showCloseButton = true,
  action = null // Optional action button
}) => {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      const timer = setTimeout(() => {
        setVisible(true)
      }, 50)
      
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
      const timer = setTimeout(() => {
        setMounted(false)
      }, 400)
      
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [isOpen, autoClose, duration])

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => {
      onClose?.()
    }, 400)
  }

  // Position and animation classes for corners
  const positionClasses = {
    'top-left': {
      container: 'top-4 left-4',
      animation: visible ? 'translate-x-0 translate-y-0' : '-translate-x-[120%] -translate-y-4'
    },
    'top-right': {
      container: 'top-4 right-4',
      animation: visible ? 'translate-x-0 translate-y-0' : 'translate-x-[120%] -translate-y-4'
    },
    'bottom-left': {
      container: 'bottom-4 left-4',
      animation: visible ? 'translate-x-0 translate-y-0' : '-translate-x-[120%] translate-y-4'
    },
    'bottom-right': {
      container: 'bottom-4 right-4',
      animation: visible ? 'translate-x-0 translate-y-0' : 'translate-x-[120%] translate-y-4'
    }
  }

  const positionStyle = positionClasses[position]

  if (!mounted) return null

  return (
    <div 
      className={`
        fixed z-50 transition-all duration-400 ease-out
        ${positionStyle.container}
        ${positionStyle.animation}
        ${visible ? 'opacity-100' : 'opacity-0'}
      `}
    >
      <div 
        className="
          min-w-[320px] max-w-md px-4 py-3 rounded-xl shadow-2xl
          flex items-center gap-3
          bg-slate-900 text-white dark:bg-slate-800
        "
      >
        {/* Message */}
        <div className="flex-1 text-sm font-medium">
          {message}
        </div>

        {/* Action Button */}
        {action && (
          <button
            onClick={action.onClick}
            className="px-3 py-1 text-xs font-medium text-white bg-white/20 hover:bg-white/30 rounded transition-colors"
          >
            {action.label}
          </button>
        )}

        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

// Loading Spinner Component
export const Loading = ({
  size = 'medium', // 'small', 'medium', 'large'
  text = '',
  fullScreen = false,
  overlay = false
}) => {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-12 h-12 border-3',
    large: 'w-16 h-16 border-4'
  }

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`
        ${sizeClasses[size]}
        border-gray-300 dark:border-gray-600
        border-t-blue-600 dark:border-t-blue-500
        rounded-full animate-spin
      `} />
      {text && (
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen || overlay) {
    return (
      <div className={`
        fixed inset-0 z-50 flex items-center justify-center
        ${overlay ? 'bg-slate-950/55 backdrop-blur-sm' : 'bg-white dark:bg-[#111318]'}
      `}>
        {spinner}
      </div>
    )
  }

  return spinner
}

// Side Drawer Component
export const Drawer = ({
  isOpen = false,
  onClose = null,
  title = '',
  children,
  showHeader = true,
  showCloseButton = true,
  position = 'right' // Only 'right' supported for now
}) => {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      document.body.style.overflow = 'hidden' // Prevent page scroll
      setTimeout(() => {
        setVisible(true)
      }, 10)
    } else {
      setVisible(false)
      setIsFullScreen(false)
      document.body.style.overflow = '' // Restore page scroll
      setTimeout(() => {
        setMounted(false)
      }, 300)
    }

    return () => {
      document.body.style.overflow = '' // Cleanup
    }
  }, [isOpen])

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => {
      onClose?.()
    }, 300)
  }

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  if (!mounted) return null

  return (
    <>
      {/* Backdrop - Partially transparent - Always covers entire screen */}
      <div
        className="fixed bottom-0 left-0 right-0 top-0 z-40 bg-slate-950 backdrop-blur-sm"
        style={{
          opacity: visible ? 0.3 : 0,
          transition: 'opacity 0.3s ease-out'
        }}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className="fixed bottom-0 right-0 top-0 z-50 flex flex-col border-l border-slate-200 bg-white shadow-2xl shadow-slate-950/20 dark:border-slate-800 dark:bg-[#111318] dark:shadow-black/50"
        style={{
          width: isFullScreen ? '100%' : '50%',
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'all 0.3s ease-out'
        }}
      >
        {/* Header */}
        {showHeader && (
          <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              {title}
            </h2>
            <div className="flex items-center gap-2">
              {/* Fullscreen Toggle Button */}
              <button
                onClick={toggleFullScreen}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                title={isFullScreen ? 'Half Screen' : 'Fullscreen'}
              >
                {isFullScreen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                )}
              </button>
              
              {/* Close Button */}
              {showCloseButton && (
                <button
                  onClick={handleClose}
                  className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  title="Close"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 text-slate-900 dark:text-white">
          {children}
        </div>
      </div>
    </>
  )
}
