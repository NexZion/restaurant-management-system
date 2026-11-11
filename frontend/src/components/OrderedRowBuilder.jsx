import { useState } from "react"
import { Button, NumberField, SelectField, TextField } from "./DataFields"
import { Chip } from "./Chip"

/**
 * Collects a set of field values into an ordered list. Rows can be reordered
 * with native drag and drop; `onChange` receives the current ordered rows.
 */
export const OrderedRowBuilder = ({
  fields = [],
  value,
  onChange,
  addLabel = "Add row",
  emptyMessage = "No rows added yet.",
  title = "Items",
}) => {
  const [draft, setDraft] = useState({})
  const [editingIndex, setEditingIndex] = useState(null)
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dropIndex, setDropIndex] = useState(null)
  const rows = value || []

  const updateDraft = (key, nextValue) => setDraft((current) => ({ ...current, [key]: nextValue }))
  const addRow = (event) => {
    event.preventDefault()
    const row = Object.fromEntries(fields.map((field) => [field.key, draft[field.key] ?? field.defaultValue ?? ""]))
    if (fields.some((field) => field.required && !String(row[field.key]).trim())) return
    if (editingIndex !== null) {
      onChange?.(rows.map((existing, index) => index === editingIndex ? { ...existing, ...row } : existing))
      setEditingIndex(null)
    } else {
      onChange?.([...rows, { ...row, id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}` }])
    }
    setDraft({})
  }

  const editRow = (row, index) => {
    setDraft(Object.fromEntries(fields.map((field) => {
      const rawValue = row[field.key] ?? ""
      const value = field.options ? String(rawValue) : rawValue
      return [field.key, value]
    })))
    setEditingIndex(index)
  }

  const moveRow = (from, to) => {
    if (from === to || from == null || to == null) return
    const next = [...rows]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange?.(next)
  }

  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold text-gray-900 dark:text-[#F7F8F8]">{title}</h2>
      <form onSubmit={addRow} className="grid grid-cols-2 items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-[#1F2226] dark:bg-[#121314]">
        {fields.map((field) => (
          <div key={field.key} className="col-span-1 w-full">
            {field.options ? (
              <SelectField label={field.label} required={field.required} value={draft[field.key] ?? field.defaultValue ?? ""} onChange={(event) => updateDraft(field.key, event.target.value)} options={field.options} placeholder={field.placeholder === false ? "" : (field.placeholder ?? `Select ${field.label}`)} />
            ) : field.type === "number" ? (
              <NumberField label={field.label} required={field.required} min={field.min} step={field.step} placeholder={field.placeholder} value={draft[field.key] ?? ""} onChange={(event) => updateDraft(field.key, event.target.value)} />
            ) : (
              <TextField label={field.label} required={field.required} placeholder={field.placeholder} value={draft[field.key] ?? ""} onChange={(event) => updateDraft(field.key, event.target.value)} />
            )}
          </div>
        ))}
        <div className="col-span-2 flex w-full gap-2">
          <Button type="submit" variant="primary" fullWidth>{editingIndex === null ? addLabel : "Update row"}</Button>
          {editingIndex !== null && <Button type="button" variant="secondary" fullWidth onClick={() => { setDraft({}); setEditingIndex(null) }}>Cancel</Button>}
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-[#1F2226] dark:bg-[#090A0B]">
        <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-gray-800 dark:border-[#1F2226] dark:text-[#F7F8F8]">Display order <span className="font-normal text-gray-500 dark:text-[#8A8F98]">(drag rows to reorder)</span></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-gray-600 dark:bg-[#121314] dark:text-[#8A8F98]"><tr><th className="w-20 px-4 py-3">Order</th>{fields.map((field) => <th key={field.key} className="px-4 py-3">{field.label}</th>)}<th className="px-4 py-3">Action</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1F2226]">
              {rows.length === 0 ? <tr><td colSpan={fields.length + 2} className="px-4 py-8 text-center text-gray-500 dark:text-[#8A8F98]">{emptyMessage}</td></tr> : rows.map((row, index) => (
                <tr key={row.id ?? index} draggable onDragStart={(event) => { setDraggedIndex(index); setDropIndex(index); event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", String(index)) }} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; setDropIndex(index) }} onDrop={(event) => { event.preventDefault(); moveRow(draggedIndex, index); setDraggedIndex(null); setDropIndex(null) }} onDragEnd={() => { setDraggedIndex(null); setDropIndex(null) }} className={`text-gray-800 transition-colors dark:text-[#D0D6E0] ${draggedIndex === index ? "bg-blue-50 opacity-60 dark:bg-[#171A2A]" : "hover:bg-slate-50 dark:hover:bg-[#121314]"} ${dropIndex === index && draggedIndex !== index ? "border-t-2 border-t-blue-500 dark:border-t-[#828FFF]" : ""}`}>
                  <td className="px-4 py-3"><span className="inline-flex items-center gap-2 text-gray-500 dark:text-[#8A8F98]"><span aria-hidden="true" className="cursor-grab text-lg active:cursor-grabbing">⠿</span>{index + 1}</span></td>
                  {fields.map((field) => {
                    const option = field.options?.find((item) => String(item.value ?? item) === String(row[field.key]))
                    const value = field.render
                      ? field.render(row[field.key], row)
                      : field.key === "is_active"
                        ? <Chip status={option?.label ?? row[field.key]} size="small" />
                        : option?.label ?? row[field.key]
                    return <td key={field.key} className="px-4 py-3">{value}</td>
                  })}
                  <td className="px-4 py-3"><div className="flex items-center gap-1">
                    <Button type="button" variant="ghost" size="icon" width={32} height={32} onClick={() => editRow(row, index)} aria-label={`Edit row ${index + 1}`} title="Edit" className="text-blue-600 dark:text-[#AAB2FF]"><svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M13.586 3.586a2 2 0 112.828 2.828l-9.9 9.9-3.8.97.97-3.8 9.902-9.898z"/><path d="M12.172 5l2.828 2.828"/></svg></Button>
                    <Button type="button" variant="ghost" size="icon" width={32} height={32} onClick={() => { onChange?.(rows.filter((_, rowIndex) => rowIndex !== index)); if (editingIndex === index) { setDraft({}); setEditingIndex(null) } else if (editingIndex > index) setEditingIndex(editingIndex - 1) }} aria-label={`Remove row ${index + 1}`} title="Remove" className="text-red-600 dark:text-red-400"><svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M8.5 2a1 1 0 00-.894.553L7.382 3H4a1 1 0 100 2h.5v10A2 2 0 006.5 17h7a2 2 0 002-2V5h.5a1 1 0 100-2h-3.382l-.224-.447A1 1 0 0011.5 2h-3zM8 7a1 1 0 012 0v7a1 1 0 11-2 0V7zm4-1a1 1 0 00-1 1v7a1 1 0 102 0V7a1 1 0 00-1-1z" clipRule="evenodd"/></svg></Button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
