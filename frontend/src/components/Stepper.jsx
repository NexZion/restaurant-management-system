import { useState } from 'react'

const stepFadeInStyle = (
  <style>{`@keyframes stepFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
)

/**
 * Stepper — 3 variants controlled by the `variant` prop:
 *
 *  • "default"  — Horizontal numbered circles joined by a line
 *  • "vertical" — Vertical numbered circles joined by a line, description on the right
 *  • "progress" — Thin progress-bar track with small dots and labels underneath
 *
 * Props
 * ─────
 * @param {Array}    steps        – [{ label, description?, icon? }]
 * @param {number}   activeStep   – 0-based index of the current step
 * @param {string}   variant      – 'default' | 'vertical' | 'progress'
 * @param {Function} onStepClick  – optional (stepIndex) => void
 * @param {string}   className    – extra wrapper classes
 */

// ── Shared check-icon ────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
)

// ─── Variant 1 : Horizontal (default) ────────────────────────────────────────
const HorizontalStepper = ({ steps, activeStep, onStepClick, clickable }) => {
  return (
    <div className="w-full flex items-start">
      {steps.map((step, idx) => {
        const isCompleted = idx < activeStep
        const isActive    = idx === activeStep

        return (
          <div key={idx} className="flex-1 flex flex-col items-center relative min-w-0">

            {/* Connector line */}
            {idx > 0 && (
              <div className={`absolute top-3 sm:top-4 -translate-y-1/2 h-0.5 -left-1/2 right-1/2
                ${isCompleted || isActive ? 'bg-blue-600 dark:bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'}`}
              />
            )}

            {/* Circle */}
            <button
              type="button"
              onClick={() => clickable && onStepClick(idx)}
              className={`relative z-10 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-sm font-semibold transition-colors flex-shrink-0
                ${clickable ? 'cursor-pointer' : 'cursor-default'}
                ${isCompleted
                  ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-sm shadow-blue-600/20'
                  : isActive
                    ? 'bg-blue-600 dark:bg-blue-500 text-white ring-4 ring-blue-500/15 shadow-sm shadow-blue-600/20'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-700'
                }`}
            >
              {step.icon && !isCompleted ? step.icon : isCompleted ? <CheckIcon /> : idx + 1}
            </button>

            {/* Label — hidden on xs, visible from sm */}
            <div className="mt-1 sm:mt-2 text-center px-0.5 w-full">
              <p className={`text-[10px] sm:text-xs font-semibold leading-tight truncate
                ${isActive ? 'text-blue-600 dark:text-blue-400' : isCompleted ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                {step.label}
              </p>
              {step.description && (
                <p className="hidden sm:block text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-tight truncate">{step.description}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Variant 2 : Vertical ─────────────────────────────────────────────────────
const VerticalStepper = ({ steps, activeStep, onStepClick, clickable }) => {
  return (
    <div className="flex flex-col w-full">
      {steps.map((step, idx) => {
        const isCompleted = idx < activeStep
        const isActive    = idx === activeStep
        const isLast      = idx === steps.length - 1

        return (
          <div key={idx} className="flex gap-3 sm:gap-4">

            {/* Left: circle + connector */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => clickable && onStepClick(idx)}
                className={`w-7 h-7 sm:w-9 sm:h-9 flex-shrink-0 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold shadow-sm transition-colors
                  ${clickable ? 'cursor-pointer' : 'cursor-default'}
                  ${isCompleted
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : isActive
                    ? 'bg-blue-600 dark:bg-blue-500 text-white ring-4 ring-blue-500/15'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-700'
                  }`}
              >
                {step.icon && !isCompleted ? step.icon : isCompleted ? <CheckIcon /> : idx + 1}
              </button>

              {/* Vertical line */}
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-[1.5rem] sm:min-h-[2rem] mt-1 mb-1 rounded
                  ${isCompleted ? 'bg-blue-600 dark:bg-blue-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </div>

            {/* Right: label + description */}
            <div className="pb-4 sm:pb-6 min-w-0">
              <p className={`text-xs sm:text-sm font-semibold mt-1 sm:mt-1.5
                ${isActive ? 'text-blue-600 dark:text-blue-400' : isCompleted ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                {step.label}
              </p>
              {step.description && (
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 leading-relaxed">{step.description}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Variant 3 : Progress ─────────────────────────────────────────────────────
const ProgressStepper = ({ steps, activeStep, onStepClick, clickable, showActiveTick = false }) => {
  const total   = steps.length
  const fillPct = activeStep < 0 || total <= 1 ? 0 : (activeStep / (total - 1)) * 100

  return (
    <div className="w-full px-2.5">

      {/* Track + dots row */}
      <div className="relative h-5 flex items-center">

        {/* Background track */}
        <div className="absolute top-1/2 -translate-y-1/2 -left-2.5 -right-2.5 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />

        {/* Filled track */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -left-2.5 h-1 rounded-full bg-blue-600 dark:bg-blue-400 transition-all duration-500"
          style={{ width: `calc(${fillPct}% + ${fillPct === 0 ? 0 : 10}px)` }}
        />

        {/* Dots */}
        {steps.map((step, idx) => {
          const isCompleted = idx < activeStep
          const isActive    = idx === activeStep
          const leftPct     = total <= 1 ? 0 : (idx / (total - 1)) * 100
          const showCheck = isCompleted || (showActiveTick && isActive)

          return (
            <button
              key={idx}
              type="button"
              onClick={() => clickable && onStepClick(idx)}
              className={`absolute z-10 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center
                ${clickable ? 'cursor-pointer' : 'cursor-default'}
                ${isCompleted
                  ? 'bg-blue-600 dark:bg-blue-400 border-blue-600 dark:border-blue-400'
                  : isActive
                    ? showActiveTick
                      ? 'bg-blue-600 dark:bg-blue-400 border-blue-600 dark:border-blue-400'
                      : 'bg-white dark:bg-gray-900 border-blue-600 dark:border-blue-400 shadow-md'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                }`}
              style={{
                left: `${leftPct}%`,
                transform: `translateX(-50%) ${isActive ? 'scale(1.25)' : ''}`,
              }}
            >
              {showCheck && (
                <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {isActive && !showActiveTick && (
                <span className="block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          )
        })}
      </div>

      {/* Labels row — hidden on xs to avoid overlap, shown from sm */}
      <div className="relative mt-3 hidden sm:block" style={{ height: '2rem' }}>
        {steps.map((step, idx) => {
          const isCompleted = idx < activeStep
          const isActive    = idx === activeStep
          const leftPct     = total <= 1 ? 0 : (idx / (total - 1)) * 100

          return (
            <div
              key={idx}
              className="absolute flex flex-col items-center"
              style={{ left: `${leftPct}%`, transform: 'translateX(-50%)' }}
            >
              <p className={`text-xs font-semibold whitespace-nowrap
                ${isActive ? 'text-blue-600 dark:text-blue-400' : isCompleted ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                {step.label}
              </p>
              {step.description && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 whitespace-nowrap">{step.description}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Active step label — shown only on xs when labels row is hidden */}
      <div className="sm:hidden mt-2 text-center">
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
          {steps[activeStep]?.label}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Step {activeStep + 1} of {total}
        </p>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export const Stepper = ({
  steps = [],
  activeStep = 0,
  variant = 'default',
  onStepClick,
  clickable,
  className = '',
}) => {
  // If `clickable` is not explicitly set, fall back to whether onStepClick is provided
  const isClickable = clickable !== undefined ? !!clickable : !!onStepClick
  const hasContent = steps.some(s => s.content != null)
  const currentContent = steps[activeStep]?.content

  return (
    <div className={className}>
      {variant === 'default'  && <HorizontalStepper steps={steps} activeStep={activeStep} onStepClick={onStepClick} clickable={isClickable} />}
      {variant === 'vertical' && <VerticalStepper   steps={steps} activeStep={activeStep} onStepClick={onStepClick} clickable={isClickable} />}
      {variant === 'progress' && <ProgressStepper   steps={steps} activeStep={activeStep} onStepClick={onStepClick} clickable={isClickable} />}

      {/* Step content panel */}
      {hasContent && (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111318]">
          {stepFadeInStyle}
          <div
            key={activeStep}
            className="p-5"
            style={{ animation: 'stepFadeIn 0.2s ease-in-out' }}
          >
            {currentContent ?? (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">No content for this step.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
