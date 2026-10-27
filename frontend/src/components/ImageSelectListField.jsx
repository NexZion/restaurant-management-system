import { useState } from "react";
import { SelectField } from "./DataFields";

/**
 * Select an image-backed option, add it to a list, then remove it if needed.
 * `value` is a controlled array of option values.
 */
export const ImageSelectListField = ({
  label = "Selected items",
  options = [],
  value = [],
  onChange,
  placeholder = "",
  addLabel = "Add item",
  addAllLabel = null,
  emptyMessage = "No items added yet.",
  searchable = true,
  optionImageSize = "medium",
  disabled = false,
  className = "",
}) => {
  const [selectedValue, setSelectedValue] = useState("");
  const selectedOptions = value
    .map((selected) =>
      options.find((option) => String(option.value) === String(selected)),
    )
    .filter(Boolean);
  const availableOptions = options.filter(
    (option) =>
      !value.some((selected) => String(selected) === String(option.value)),
  );
  const canAdd =
    selectedValue !== "" &&
    availableOptions.some(
      (option) => String(option.value) === String(selectedValue),
    );

  const addSelected = () => {
    if (!canAdd || disabled) return;
    const option = availableOptions.find(
      (item) => String(item.value) === String(selectedValue),
    );
    onChange?.([...value, option.value]);
    setSelectedValue("");
  };

  const addAllAvailable = () => {
    if (disabled || availableOptions.length === 0) return;
    onChange?.([...value, ...availableOptions.map((option) => option.value)]);
    setSelectedValue("");
  };

  const removeSelected = (optionValue) => {
    onChange?.(
      value.filter((selected) => String(selected) !== String(optionValue)),
    );
  };

  return (
    <div className={`flex w-full flex-col gap-3 ${className}`}>
      {label && (
        <h3 className="text-sm font-semibold text-slate-800 dark:text-[#D0D6E0]">
          {label}
        </h3>
      )}

      <div className="flex items-start gap-2">
        <SelectField
          label="Choose an item"
          value={selectedValue}
          options={availableOptions}
          onChange={(event) => setSelectedValue(event.target.value)}
          placeholder={placeholder}
          searchable={searchable}
          optionImageSize={optionImageSize}
          disabled={disabled || availableOptions.length === 0}
          className="flex-1"
        />
        <button
          type="button"
          onClick={addSelected}
          disabled={disabled || !canAdd}
          className="mt-0.5 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#5E6AD2] dark:hover:bg-[#4D5CC5]"
        >
          {addLabel}
        </button>
        {addAllLabel && (
          <button
            type="button"
            onClick={addAllAvailable}
            disabled={disabled || availableOptions.length === 0}
            className="mt-0.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#30343A] dark:bg-[#161719] dark:text-[#D0D6E0] dark:hover:bg-[#1A1C20]"
          >
            {addAllLabel}
          </button>
        )}
      </div>

      {selectedOptions.length ? (
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 dark:divide-[#1F2226] dark:border-[#1F2226]">
          {selectedOptions.map((option) => (
            <li key={option.value} className="flex items-center gap-3 p-3">
              {(option.image || option.imageSrc) && (
                <img
                  src={option.image || option.imageSrc}
                  alt={option.imageAlt || option.label}
                  className="h-12 w-12 shrink-0 rounded-md object-cover"
                  loading="lazy"
                />
              )}
              <span className="min-w-0 flex-1 truncate text-sm text-slate-800 dark:text-[#D0D6E0]">
                {option.label}
              </span>
              <button
                type="button"
                onClick={() => removeSelected(option.value)}
                disabled={disabled}
                aria-label={`Remove ${option.label}`}
                title={`Remove ${option.label}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30 dark:hover:bg-rose-500/20"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 dark:border-[#30343A] dark:text-[#8A8F98]">
          {emptyMessage}
        </div>
      )}
    </div>
  );
};

export default ImageSelectListField;
