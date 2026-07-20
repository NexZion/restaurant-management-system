import { useState } from 'react'
import { Button } from './DataFields'

const PlaceholderImage = ({ compact }) => (
  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950/40">
    <div className="rounded-full bg-white/85 p-3 shadow-sm ring-1 ring-slate-200/80 dark:bg-white/5 dark:ring-white/10">
      <svg className={compact ? 'h-6 w-6 text-blue-400' : 'h-9 w-9 text-blue-400'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.5c-3.5-3-7.5-.5-7.5 3 0 4.5 7.5 8.5 7.5 8.5s7.5-4 7.5-8.5c0-3.5-4-6-7.5-3z" />
      </svg>
    </div>
  </div>
)

const actionIcons = {
  view: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" /><circle cx="12" cy="12" r="2.5" strokeWidth={2} /></>,
  edit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 3.5a2.1 2.1 0 013 3L8 18l-4 1 1-4L16.5 3.5z" />,
  delete: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16m-10 4v6m4-6v6m-7-10 1 13h8l1-13m-7-3h4l1 3H9l1-3z" />,
  cart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h2l2.2 10.5a2 2 0 002 1.5h7.9a2 2 0 002-1.6L20.5 8H7m3 12a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />,
}

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5',
  6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6',
  7: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7',
  8: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8',
}

const defaultVisibility = {
  image: true,
  status: true,
  category: true,
  name: true,
  price: true,
  description: true,
  code: true,
  actions: true,
}

/**
 * Menu card grid for administration, POS and billing screens.
 *
 * columns        1-8
 * show           Object of field visibility flags (image, status, category,
 *                name, price, description, code, actions)
 * variant        "default" | "compact"
 * onAddToCart    Adds a full-width cart button when supplied
 * customActions  [{ label, icon, onClick, className }]
 * actionButtonWidth / actionButtonHeight  Admin/custom action button dimensions
 * cartButtonWidth / cartButtonHeight      Add-to-cart button dimensions
 * pagination     Show pagination controls. Default: true
 * itemsPerPage   Number of cards per page. Default: 12
 * renderExtra    (item) => ReactNode, rendered above the footer
 * renderFooter   (item) => ReactNode, replaces the built-in footer
 */
export const MenuItemCardList = ({
  items = [],
  columns = 3,
  gap = 'normal',
  variant = 'default',
  show = {},
  currency = 'USD',
  locale = 'en-US',
  priceFormatter,
  onCardClick,
  onView,
  onEdit,
  onDelete,
  onAddToCart,
  addToCartLabel = 'Add to cart',
  actionButtonWidth = 32,
  actionButtonHeight = 32,
  cartButtonWidth = '100%',
  cartButtonHeight = 40,
  pagination = true,
  itemsPerPage = 12,
  disableUnavailableCart = true,
  customActions = [],
  renderImage,
  renderExtra,
  renderFooter,
  emptyMessage = 'No menu items found.',
  className = '',
  cardClassName = '',
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const visible = { ...defaultVisibility, ...show }
  const safeColumns = Math.min(8, Math.max(1, Number(columns) || 3))
  const compact = variant === 'compact' || safeColumns > 4
  const gaps = { tight: 'gap-2', normal: 'gap-4', relaxed: 'gap-6' }
  const safePageSize = Math.max(1, Number(itemsPerPage) || 12)
  const totalPages = pagination ? Math.max(1, Math.ceil(items.length / safePageSize)) : 1
  const activePage = Math.min(currentPage, totalPages)
  const visibleItems = pagination
    ? items.slice((activePage - 1) * safePageSize, activePage * safePageSize)
    : items

  const formatPrice = (price, item) => priceFormatter
    ? priceFormatter(price, item)
    : new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(price) || 0)

  const actions = [
    { type: 'view', label: 'View', onClick: onView },
    { type: 'edit', label: 'Edit', onClick: onEdit },
    { type: 'delete', label: 'Delete', onClick: onDelete },
    ...customActions,
  ].filter((action) => action.onClick)

  if (!items.length) {
    return (
      <div className={`rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-[#111318] dark:text-slate-400 ${className}`}>
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={className}>
      <div className={`grid ${columnClasses[safeColumns]} ${gaps[gap] || gaps.normal}`}>
      {visibleItems.map((item) => {
        const cartDisabled = disableUnavailableCart && item.available === false

        return (
          <article
            key={item.id}
            onClick={onCardClick ? () => onCardClick(item) : undefined}
            className={`group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/70 dark:border-slate-800 dark:bg-[#111318] dark:hover:border-blue-400/30 dark:hover:shadow-black/30 ${onCardClick ? 'cursor-pointer' : ''} ${cardClassName}`}
          >
            {visible.image && (
              <div className={`relative overflow-hidden bg-slate-100 dark:bg-[#171a21] ${compact ? 'h-28' : 'h-44'}`}>
                {renderImage ? renderImage(item) : item.image ? (
                  <img src={item.image} alt={item.name || 'Menu item'} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                ) : <PlaceholderImage compact={compact} />}
                {visible.status && (
                  <span className={`absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border px-2 py-1 font-semibold shadow-sm backdrop-blur ${compact ? 'text-[10px]' : 'text-xs'} ${item.available !== false ? 'border-emerald-200 bg-white/90 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/15 dark:text-emerald-300' : 'border-slate-200 bg-white/90 text-slate-600 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-300'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${item.available !== false ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {item.available !== false ? 'Available' : 'Unavailable'}
                  </span>
                )}
              </div>
            )}

            <div className={`flex flex-1 flex-col ${compact ? 'p-3' : 'p-4'}`}>
              {!visible.image && visible.status && (
                <div className={`mb-2 flex items-center gap-1.5 text-xs font-medium ${item.available !== false ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${item.available !== false ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {item.available !== false ? 'Available' : 'Unavailable'}
                </div>
              )}

              {visible.category && item.category && (
                <p className={`mb-1 truncate font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-300 ${compact ? 'text-[10px]' : 'text-xs'}`}>{item.category}</p>
              )}

              <div className="flex items-start justify-between gap-2">
                {visible.name && <h3 className={`min-w-0 flex-1 font-semibold leading-tight text-slate-950 dark:text-white ${compact ? 'line-clamp-2 text-sm' : 'truncate text-lg'}`}>{item.name}</h3>}
                {visible.price && <p className={`shrink-0 font-bold text-slate-950 dark:text-white ${compact ? 'text-sm' : 'text-lg'}`}>{formatPrice(item.price, item)}</p>}
              </div>

              {visible.description && item.description && (
                <p className={`text-slate-600 dark:text-slate-400 ${compact ? 'mt-1 line-clamp-2 text-xs leading-4' : 'mt-2 min-h-10 line-clamp-2 text-sm leading-5'}`}>{item.description}</p>
              )}

              {renderExtra && <div className="mt-3">{renderExtra(item)}</div>}

              <div className="mt-auto pt-3">
                {renderFooter ? renderFooter(item) : (visible.code || (visible.actions && actions.length > 0)) && (
                  <div className="flex min-h-8 items-center justify-between gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
                    {visible.code && <span className="truncate text-[11px] text-gray-500 dark:text-gray-400">{item.code ? `#${item.code}` : `#${item.id}`}</span>}
                    {visible.actions && actions.length > 0 && (
                      <div className="ml-auto flex items-center gap-0.5">
                        {actions.map((action, index) => (
                          <Button
                            key={action.type || action.label || index}
                            onClick={(event) => { event.stopPropagation(); action.onClick(item) }}
                            aria-label={`${action.label} ${item.name}`}
                            title={action.label}
                            variant="ghost"
                            size="icon"
                            width={action.width ?? actionButtonWidth}
                            height={action.height ?? actionButtonHeight}
                            className={`shrink-0 ${action.type === 'delete' ? 'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400' : ''} ${action.className || ''}`}
                          >
                            {action.icon || <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{actionIcons[action.type] || actionIcons.view}</svg>}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {onAddToCart && (
                  <Button
                    disabled={cartDisabled}
                    onClick={(event) => { event.stopPropagation(); onAddToCart(item) }}
                    variant="primary"
                    size={compact ? 'small' : 'medium'}
                    width={cartButtonWidth}
                    height={cartButtonHeight}
                    startIcon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{actionIcons.cart}</svg>}
                    className="mt-2 shadow-sm"
                  >
                    {cartDisabled ? 'Unavailable' : addToCartLabel}
                  </Button>
                )}
              </div>
            </div>
          </article>
        )
      })}
      </div>

      {pagination && totalPages > 1 && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {(activePage - 1) * safePageSize + 1}–{Math.min(activePage * safePageSize, items.length)} of {items.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outlined"
              size="small"
              disabled={activePage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              Previous
            </Button>
            <span className="min-w-20 text-center text-sm font-medium text-gray-700 dark:text-gray-200">
              {activePage} / {totalPages}
            </span>
            <Button
              variant="outlined"
              size="small"
              disabled={activePage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
