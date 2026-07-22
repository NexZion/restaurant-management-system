/**
 * AddItem — A dynamic, row-based input component.
 *
 * Also exports ImageGridField — a standalone image-grid picker used by Products
 * for the images tab. Each cell shows a thumbnail (existing URL or new File
 * preview), a hidden file-input to replace the image, a display_order badge,
 * and a remove button.
 *
 * ─── AddItem Props ────────────────────────────────────────────────────────────
 *
 *  fields        {Array}     Column / field definitions (see below).
 *  value         {Array}     Controlled array of row objects.
 *  onChange      {Function}  (rows) => void — called whenever rows change.
 *  addLabel      {string}    Label on the Add button.          Default: "Add Row"
 *  label         {string}    Optional section label shown above the component.
 *  emptyMessage  {string}    Text shown when there are no rows.
 *  emptyIcon     {JSX}       Custom icon element for the empty state.
 *  className     {string}    Extra class names on the root wrapper.
 *
 * ─── ImageGridField Props ─────────────────────────────────────────────────────
 *
 *  value         {Array}     Array of { image: File|string|null, display_order: number,
 *                                       _url?: string }  — controlled.
 *  onChange      {Function}  (items) => void
 *  label         {string}    Section label.
 *  addLabel      {string}    Button label.   Default: "Add Image"
 *  maxImages     {number}    Max images allowed.  Default: 20
 *
 * Each item in value:
 *   image         — File (new upload) | string (existing storage path, e.g. "product-images/xxx.jpg")
 *   _url          — Full display URL (populated by parent for existing images, auto-generated for new Files)
 *   display_order — integer
 *
 * ─── Field Definition (AddItem) ──────────────────────────────────────────────
 *  { key, label, type, placeholder, options, width, defaultValue, required,
 *    disabled, min, max, step, rows, row, searchable, multiple }
 */

import { useState, useEffect, useRef } from 'react'
import {
    Button,
    TextField,
    NumberField,
    SelectField,
    TextAreaField,
    CheckboxField,
    ToggleSwitch,
    RadioField,
    ImageUploadField,
    ImageGridUploadField,
} from './DataFields'
import { storageUrl } from '../utils/storageUrl'

// ─── Default empty-state icon ─────────────────────────────────────────────────
const DefaultEmptyIcon = () => (
    <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
)

// ─── ImageGridField ───────────────────────────────────────────────────────────
export const ImageGridField = ({
    value      = [],
    onChange,
    label      = 'Product Images',
    addLabel   = 'Add Image',
    maxImages  = 20,
}) => {
    const fileInputRef = useRef(null)

    // Derive a preview URL for any item
    const previewUrl = (item) => {
        if (!item.image) return null
        if (item.image instanceof File) return URL.createObjectURL(item.image)
        if (item._url) return item._url
        if (typeof item.image === 'string' && item.image.startsWith('http')) return item.image
        return storageUrl(item.image)
    }

    const addImages = (files) => {
        const newItems = Array.from(files)
            .slice(0, maxImages - value.length)
            .map((file, i) => ({
                image: file,
                _url: URL.createObjectURL(file),
                display_order: value.length + i + 1,
            }))
        onChange([...value, ...newItems])
    }

    const replaceImage = (index, file) => {
        const updated = value.map((item, i) =>
            i === index
                ? { ...item, image: file, _url: URL.createObjectURL(file) }
                : item
        )
        onChange(updated)
    }

    const removeImage = (index) => {
        onChange(value.filter((_, i) => i !== index))
    }

    const updateOrder = (index, order) => {
        onChange(value.map((item, i) =>
            i === index ? { ...item, display_order: Number(order) } : item
        ))
    }

    const handleDrop = (e) => {
        e.preventDefault()
        if (e.dataTransfer.files?.length) addImages(e.dataTransfer.files)
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Top bar */}
            <div className="flex items-center justify-between">
                {label && <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</span>}
                <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={value.length >= maxImages}
                    startIcon={
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    }
                >
                    {addLabel}
                </Button>
                {/* hidden multi-file input for "Add Image" button */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/gif"
                    multiple
                    className="hidden"
                    onChange={(e) => { if (e.target.files?.length) addImages(e.target.files); e.target.value = '' }}
                />
            </div>

            {/* Empty / drop zone */}
            {value.length === 0 ? (
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/70 py-10 transition-colors hover:border-blue-300 hover:bg-blue-50/60 dark:border-slate-700 dark:bg-slate-900/30 dark:hover:border-blue-500 dark:hover:bg-blue-500/10"
                >
                    <svg className="w-10 h-10 text-gray-300 dark:text-gray-600 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-400 dark:text-gray-500 select-none">Drop images here or click to upload</p>
                </div>
            ) : (
                <div>
                    {/* Image grid */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="grid gap-3"
                        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}
                    >
                        {value.map((item, index) => {
                            const url = previewUrl(item)
                            const isNew = item.image instanceof File
                            return (
                                <ImageGridCell
                                    key={index}
                                    url={url}
                                    isNew={isNew}
                                    displayOrder={item.display_order}
                                    onReplace={(file) => replaceImage(index, file)}
                                    onRemove={() => removeImage(index)}
                                    onOrderChange={(v) => updateOrder(index, v)}
                                />
                            )
                        })}

                        {/* Drop-to-add extra cell */}
                        {value.length < maxImages && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                            className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition-colors hover:border-blue-400 hover:text-blue-500 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-blue-500"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-xs">Add</span>
                            </button>
                        )}
                    </div>

                    {/* Footer count */}
                    <div className="mt-3 border-t border-slate-100 pt-2 dark:border-slate-800">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                            {value.length} image{value.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── ImageGrid ────────────────────────────────────────────────────────────────
// A standalone image-grid component that uses ImageGridUploadField (rectangular,
// non-round). Each cell has its own rectangular upload field plus a display_order
// input below it. Fully separate from AddItem and ImageGridField.
//
// Props:
//   value       {Array}    Array of { image: File|string|null, display_order: number, _url?: string }
//   onChange    {Function} (items) => void
//   label       {string}   Section label
//   addLabel    {string}   Button label. Default: "Add Image"
//   maxImages   {number}   Default: 20
//   columns     {number}   Grid columns (auto-fill if omitted)
// ─────────────────────────────────────────────────────────────────────────────
export const ImageGrid = ({
    value     = [],
    onChange,
    label     = 'Product Images',
    addLabel  = 'Add Image',
    maxImages = 20,
    columns,
}) => {
    const fileInputRef = useRef(null)

    const addImages = (files) => {
        const newItems = Array.from(files)
            .slice(0, maxImages - value.length)
            .map((file, i) => ({
                image:         file,
                _url:          URL.createObjectURL(file),
                display_order: value.length + i + 1,
            }))
        onChange([...value, ...newItems])
    }

    const updateImage = (index, file) => {
        onChange(value.map((item, i) =>
            i === index
                ? { ...item, image: file, _url: file ? URL.createObjectURL(file) : null }
                : item
        ))
    }

    const removeImage = (index) => {
        onChange(value.filter((_, i) => i !== index))
    }

    const updateOrder = (index, order) => {
        onChange(value.map((item, i) =>
            i === index ? { ...item, display_order: Number(order) } : item
        ))
    }

    const handleDrop = (e) => {
        e.preventDefault()
        if (e.dataTransfer.files?.length) addImages(e.dataTransfer.files)
    }

    // Resolve preview URL for existing (string path) or new (File) images
    const resolveUrl = (item) => {
        if (!item.image) return null
        if (item.image instanceof File) return item._url ?? URL.createObjectURL(item.image)
        if (item._url) return item._url
        if (typeof item.image === 'string' && item.image.startsWith('http')) return item.image
        return storageUrl(item.image)
    }

    const gridStyle = columns
        ? { gridTemplateColumns: `repeat(${columns}, 1fr)` }
        : { gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }

    return (
        <div className="flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                {label && (
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</span>
                )}
                <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={value.length >= maxImages}
                    startIcon={
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    }
                >
                    {addLabel}
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) => { if (e.target.files?.length) addImages(e.target.files); e.target.value = '' }}
                />
            </div>

            {/* Empty / drop zone */}
            {value.length === 0 ? (
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/70 py-10 transition-colors hover:border-blue-300 hover:bg-blue-50/60 dark:border-slate-700 dark:bg-slate-900/30 dark:hover:border-blue-500 dark:hover:bg-blue-500/10"
                >
                    <svg className="w-10 h-10 text-gray-300 dark:text-gray-600 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-400 dark:text-gray-500 select-none">Drop images here or click to upload</p>
                </div>
            ) : (
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <div className="grid gap-3" style={gridStyle}>
                        {value.map((item, index) => (
                            <div key={index} className="flex flex-col gap-1.5">
                                {/* Rectangular image upload cell */}
                                <ImageGridUploadField
                                    value={resolveUrl(item) ?? item.image}
                                    onChange={(file) => file ? updateImage(index, file) : removeImage(index)}
                                    aspectRatio="4/3"
                                    fullWidth
                                />
                                {/* Display order input below the image */}
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">Order</span>
                                    <input
                                        type="number"
                                        value={item.display_order ?? ''}
                                        min={1}
                                        onChange={(e) => updateOrder(index, e.target.value)}
                                        className="w-full border border-gray-200 dark:border-gray-700 rounded px-2 py-0.5 text-xs text-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Add more cell */}
                        {value.length < maxImages && (
                            <div className="flex flex-col gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition-colors hover:border-blue-400 hover:text-blue-500 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-blue-500 dark:hover:text-blue-400"
                                    style={{ aspectRatio: '4/3' }}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span className="text-xs">Add</span>
                                </button>
                                <div style={{ height: 22 }} /> {/* spacer to align with order inputs */}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-3 border-t border-slate-100 pt-2 dark:border-slate-800">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                            {value.length} image{value.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Single image cell inside the grid ───────────────────────────────────────
const ImageGridCell = ({ url, isNew, displayOrder, onReplace, onRemove, onOrderChange }) => {
    const replaceRef = useRef(null)
    const [orderEditing, setOrderEditing] = useState(false)

    return (
        <div className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            {/* Thumbnail */}
            {url ? (
                <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            )}

            {/* New badge */}
            {isNew && (
                <span className="absolute top-1 left-1 text-[10px] font-semibold bg-blue-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                    NEW
                </span>
            )}

            {/* Display order badge — click to edit */}
            <button
                type="button"
                className="absolute bottom-1 left-1 text-[10px] font-semibold bg-black/50 text-white px-1.5 py-0.5 rounded-full leading-none hover:bg-black/70 transition-colors"
                onClick={() => setOrderEditing(true)}
                title="Click to change order"
            >
                #{displayOrder ?? 0}
            </button>

            {/* Order edit popover */}
            {orderEditing && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 flex flex-col gap-2 w-28 shadow-xl">
                        <span className="text-xs text-gray-600 dark:text-gray-300 text-center">Display order</span>
                        <input
                            type="number"
                            defaultValue={displayOrder ?? 0}
                            min={0}
                            autoFocus
                            className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            onBlur={(e) => { onOrderChange(e.target.value); setOrderEditing(false) }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') { onOrderChange(e.target.value); setOrderEditing(false) }
                                if (e.key === 'Escape') setOrderEditing(false)
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Hover overlay: replace / remove */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                    type="button"
                    title="Replace image"
                    onClick={() => replaceRef.current?.click()}
                    className="p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 transition-colors shadow"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                </button>
                <button
                    type="button"
                    title="Remove image"
                    onClick={onRemove}
                    className="p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-red-600 transition-colors shadow"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            {/* Hidden replace-file input */}
            <input
                ref={replaceRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/gif"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) onReplace(e.target.files[0]); e.target.value = '' }}
            />
        </div>
    )
}

// ─── AddItem ──────────────────────────────────────────────────────────────────
export const AddItem = ({
    fields        = [],
    value         = [],
    onChange,
    addLabel      = 'Add Row',
    label,
    emptyMessage  = 'No items yet. Click the button above to add one.',
    emptyIcon,
    className     = '',
    errors        = [],
}) => {

    const isBooleanType = (type) => type === 'checkbox' || type === 'toggle'

    const addRow = () => {
        const newRow = {}
        fields.forEach(f => {
            newRow[f.key] =
                f.defaultValue !== undefined
                    ? f.defaultValue
                    : f.multiple
                        ? []
                        : f.type === 'image'
                            ? null
                            : isBooleanType(f.type)
                                ? false
                                : ''
        })
        onChange([...value, newRow])
    }

    const updateRow = (rowIndex, key, val) => {
        onChange(value.map((row, i) => i === rowIndex ? { ...row, [key]: val } : row))
    }

    const removeRow = (rowIndex) => {
        onChange(value.filter((_, i) => i !== rowIndex))
    }

    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth < 640 : false
    )
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 639px)')
        setIsMobile(mq.matches)
        const handler = (e) => setIsMobile(e.matches)
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, [])

    const rowStyle = {
        display: 'grid',
        gridTemplateColumns: [...fields.map(f => f.width || '1fr'), '36px'].join(' '),
        gap: '0.5rem',
        alignItems: 'center',
    }

    const resolveValue = (valueOrFactory, row, rowIndex) => (
        typeof valueOrFactory === 'function' ? valueOrFactory(row, rowIndex, value) : valueOrFactory
    )

    const renderCell = (field, cellValue, onCellChange, rowIndex, row) => {
        const { label, type, placeholder, disabled, options, searchable, allowAdd, onAdd, multiple, required, min, max, step, decimals, integerOnly, rows, row: radioRow, showErrorText = true } = field
        const rowErrors = errors[rowIndex] || {}
        const fieldError = rowErrors[field.key]
        const hasError = !!fieldError
        const resolvedDisabled = resolveValue(disabled, row, rowIndex)
        const resolvedOptions = resolveValue(options, row, rowIndex) || []
        const resolvedSearchable = resolveValue(searchable, row, rowIndex) || false
        const resolvedAddable = resolveValue(allowAdd, row, rowIndex) || false
        const resolvedOnAdd = onAdd
        const resolvedMultiple = resolveValue(multiple, row, rowIndex) || false
        const resolvedRequired = resolveValue(required, row, rowIndex) || false

        switch (type) {
            case 'number':
                return (
                    <NumberField
                        fullWidth
                        label={label}
                        value={cellValue}
                        onChange={e => onCellChange(e.target.value)}
                        placeholder={placeholder || ''}
                        disabled={!!resolvedDisabled}
                        min={min}
                        max={max}
                        step={step}
                        decimals={decimals}
                        integerOnly={!!integerOnly}
                        error={hasError}
                        helperText={showErrorText ? fieldError || '' : ''}
                    />
                )

            case 'select':
                return (
                    <SelectField
                        fullWidth
                        label={label}
                        value={cellValue}
                        options={resolvedOptions}
                        onChange={e => onCellChange(e.target.value)}
                        placeholder={placeholder || ''}
                        disabled={!!resolvedDisabled}
                        searchable={resolvedSearchable}
                        allowAdd={resolvedAddable}
                        onAdd={(query) => resolvedOnAdd?.(query, row, rowIndex, field)}
                        multiple={resolvedMultiple}
                        required={resolvedRequired}
                        error={hasError}
                        helperText={showErrorText ? fieldError || '' : ''}
                    />
                )

            case 'textarea':
                return (
                    <TextAreaField
                        fullWidth
                        label={label}
                        value={cellValue}
                        onChange={e => onCellChange(e.target.value)}
                        placeholder={placeholder || ''}
                        rows={rows || 2}
                        disabled={!!disabled}
                        resize="none"
                    />
                )

            case 'checkbox':
                return (
                    <CheckboxField
                        label={label}
                        checked={!!cellValue}
                        onChange={e => onCellChange(e.target.checked)}
                        disabled={!!disabled}
                    />
                )

            case 'toggle':
                return (
                    <div className="flex flex-col gap-1 pt-1">
                        {label && (
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
                        )}
                        <ToggleSwitch
                            checked={!!cellValue}
                            onChange={e => onCellChange(e.target.checked)}
                            disabled={!!disabled}
                            size="small"
                        />
                    </div>
                )

            case 'radio':
                return (
                    <RadioField
                        label={label}
                        value={cellValue}
                        options={resolvedOptions}
                        onChange={e => onCellChange(e.target.value)}
                        name={field.key}
                        disabled={!!resolvedDisabled}
                        row={radioRow !== undefined ? radioRow : true}
                    />
                )

            case 'image':
                return (
                    <ImageUploadField
                        label={label}
                        value={cellValue}
                        onChange={(file) => onCellChange(file)}
                        disabled={!!disabled}
                        required={!!required}
                        fullWidth
                    />
                )

            default: // 'text'
                return (
                    <TextField
                        fullWidth
                        label={label}
                        value={cellValue}
                        onChange={e => onCellChange(e.target.value)}
                        placeholder={placeholder || ''}
                        disabled={!!disabled}
                    />
                )
        }
    }

    return (
        <div className={`flex flex-col gap-3 ${className}`}>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                {label
            ? <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</span>
                    : <span />
                }
                <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    onClick={addRow}
                    startIcon={
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    }
                >
                    {addLabel}
                </Button>
            </div>

            {value.length === 0 ? (
                <div
                    onClick={addRow}
                    className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/70 py-10 transition-colors hover:border-blue-300 hover:bg-blue-50/60 dark:border-slate-700 dark:bg-slate-900/30 dark:hover:border-blue-500 dark:hover:bg-blue-500/10"
                >
                    <div className="group-hover:scale-110 transition-transform duration-200">
                        {emptyIcon || <DefaultEmptyIcon />}
                    </div>
                    <p className="text-sm text-gray-400 dark:text-gray-500 select-none">{emptyMessage}</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {value.map((row, rowIndex) => (
                        <div
                            key={rowIndex}
                            style={isMobile ? {} : rowStyle}
                            className={`group ${isMobile ? 'flex flex-col gap-3 items-stretch' : ''}`}
                        >
                            <div
                                style={isMobile ? {} : { display: 'contents' }}
                                className={isMobile ? 'flex flex-col gap-3 flex-1 min-w-0 w-full' : ''}
                            >
                                {fields.map(field => (
                                    <div key={field.key} className={isMobile ? 'w-full' : ''}>
                                        {renderCell(
                                            field,
                                            row[field.key] ?? (isBooleanType(field.type) ? false : ''),
                                            val => updateRow(rowIndex, field.key, val),
                                            rowIndex,
                                            row
                                        )}
                                    </div>
                                ))}
                            </div>

                            <Button
                                type="button"
                                variant="secondary"
                                size="small"
                                onClick={() => removeRow(rowIndex)}
                                title="Remove row"
                                className={isMobile ? 'w-full justify-center' : ''}
                                startIcon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                }
                            />
                        </div>
                    ))}

                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                            {value.length} row{value.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}
