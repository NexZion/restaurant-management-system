import { useState, useRef, useEffect, useMemo, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

export const TextField = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  error = false,
  helperText = "",
  disabled = false,
  required = false,
  fullWidth = false,
  variant = "outlined", // outlined, filled, standard
  showPasswordToggle = true, // Show/hide password toggle for password fields
  floatLabel = false,
  className = "",
  min,
  max,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const variantStyles = {
    outlined: `border ${error ? "border-red-500 focus:border-red-500" : "border-slate-300 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"} rounded-lg shadow-sm`,
    filled: `border ${error ? "border-red-500 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"} bg-slate-50 dark:bg-slate-900/60 rounded-lg shadow-sm`,
    standard: `border-b ${error ? "border-b-red-500" : "border-b-slate-300 dark:border-b-slate-700 focus:border-b-blue-500"}`,
  };

  const isPasswordField = type === "password";
  const inputType = isPasswordField && showPassword ? "text" : type;

  return (
    <div
      className={`flex flex-col gap-1 ${fullWidth ? "w-full" : ""} ${className}`}
    >
      <div className="relative">
        {/* Label */}
        {label && (
          <label
            className={`absolute left-3 transition-all duration-200 pointer-events-none
              ${floatLabel || isFocused || value ? "text-xs -top-2.5 bg-white dark:bg-[#111318] px-1" : "text-sm top-1/2 -translate-y-1/2"}
              ${error ? "text-red-500" : isFocused ? "text-blue-600 dark:text-blue-300" : "text-slate-500 dark:text-slate-300"}
            `}
          >
            {label}
            {required && " *"}
          </label>
        )}

        {/* Password Toggle Button */}
        {isPasswordField && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg
                className="w-5 h-5 cursor-pointer"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 cursor-pointer"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        )}

        {/* Input */}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          max={max}
          disabled={disabled}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full text-sm
            ${label ? "py-4" : "py-3"}
            ${isPasswordField && showPasswordToggle ? "px-3 pr-10" : "px-3"}
            bg-white dark:bg-[#111318]
            text-slate-950 dark:text-white
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            outline-none
            transition-all duration-200
            ${variantStyles[variant]}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        />
      </div>

      {/* Helper Text / Error Message */}
      {helperText && (
        <span
          className={`text-xs px-3 ${error ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
        >
          {helperText}
        </span>
      )}
    </div>
  );
};

export const ImageUploadField = ({
  label,
  value,
  onChange,
  error = false,
  helperText = "",
  disabled = false,
  required = false,
  fullWidth = false,
  accept = "image/*",
  showRemove = true,
  avatarSize = 96, // px
  uploadButtonLabel = "Change",
  placeholderIcon = (
    <svg
      className="w-12 h-12 text-gray-300"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  ),
}) => {
  const [image, setImage] = useState(value || null);
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      onChange && onChange(file);
    }
  };

  const handleRemove = () => {
    setImage(null);
    onChange && onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleUploadClick = () => {
    if (inputRef.current) inputRef.current.click();
  };

  const BASE_URL = import.meta.env.VITE_API_URL + "/storage/";

  const avatarUrl = image
    ? typeof image === "string"
      ? image.startsWith("http")
        ? image
        : BASE_URL + image
      : URL.createObjectURL(image)
    : null;

  return (
    <div
      className={`flex flex-col gap-2 items-center ${fullWidth ? "w-full" : ""}`}
    >
      {label && (
        <label
          className={`text-sm font-medium mb-1 ${error ? "text-red-500" : "text-gray-900 dark:text-white"}`}
        >
          {label}
          {required && " *"}
        </label>
      )}
      <div
        className="relative group"
        style={{ width: avatarSize, height: avatarSize }}
      >
        <div
          className={`flex items-center justify-center overflow-hidden rounded-full border-2 shadow-sm ${error ? "border-red-500" : "border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900"}`}
          style={{ width: avatarSize, height: avatarSize }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile Preview"
              className="object-cover w-full h-full"
            />
          ) : (
            placeholderIcon
          )}
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={handleUploadClick}
            className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center rounded-full bg-slate-950/55 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
            tabIndex={-1}
            style={{ width: avatarSize, height: avatarSize }}
          >
            <svg
              className="w-7 h-7 text-white mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="text-xs text-white font-semibold">
              {uploadButtonLabel}
            </span>
          </button>
        )}
        {showRemove && avatarUrl && !disabled && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-red-500 text-xs text-white shadow-lg transition-colors hover:bg-red-600 dark:border-slate-900"
            tabIndex={-1}
            title="Remove image"
          >
            ×
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={disabled}
          required={required}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>
      {helperText && (
        <span
          className={`text-xs text-center ${error ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
        >
          {helperText}
        </span>
      )}
    </div>
  );
};

// ─── ImageGridUploadField ─────────────────────────────────────────────────────
// Rectangular (non-round) single-image upload field designed for use inside
// image grids. Shows a thumbnail preview, hover overlay to change, and a
// remove button. Unlike ImageUploadField it is NOT circular.
export const ImageGridUploadField = ({
  label,
  value,
  onChange,
  error = false,
  helperText = "",
  disabled = false,
  required = false,
  fullWidth = false,
  accept = "image/jpeg,image/png,image/jpg,image/gif,image/webp",
  aspectRatio = "4/3", // CSS aspect-ratio string, e.g. '1/1', '16/9'
  showRemove = true,
}) => {
  const inputRef = useRef(null);
  const BASE_URL = import.meta.env.VITE_API_URL + "/storage/";

  const previewUrl = value
    ? value instanceof File
      ? URL.createObjectURL(value)
      : typeof value === "string"
        ? value.startsWith("http") ||
          value.startsWith("blob:") ||
          value.startsWith("data:")
          ? value
          : BASE_URL + value
        : null
    : null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange?.(file);
      e.target.value = "";
    }
  };

  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? "w-full" : ""}`}>
      {label && (
        <label
          className={`text-xs font-medium ${error ? "text-red-500" : "text-gray-600 dark:text-gray-400"}`}
        >
          {label}
          {required && " *"}
        </label>
      )}

      <div
        className={`group relative overflow-hidden rounded-lg border-2 bg-slate-50 shadow-sm dark:bg-slate-900
          ${error ? "border-red-500" : "border-slate-200 dark:border-slate-700"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        style={{ aspectRatio }}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-slate-300 dark:text-slate-600">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs select-none">Click to upload</span>
          </div>
        )}

        {/* Hover overlay */}
        {!disabled && previewUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/0 opacity-0 transition-colors group-hover:bg-slate-950/55 group-hover:opacity-100">
            <div className="flex flex-col items-center gap-1 text-white">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              <span className="text-xs font-semibold">Replace</span>
            </div>
          </div>
        )}

        {/* Remove button */}
        {showRemove && previewUrl && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange?.(null);
            }}
            className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-md bg-red-500 text-xs text-white shadow transition-colors hover:bg-red-600"
            tabIndex={-1}
            title="Remove image"
          >
            ×
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={disabled}
          required={required}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {helperText && (
        <span
          className={`text-xs ${error ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
        >
          {helperText}
        </span>
      )}
    </div>
  );
};

export const NumberField = ({
  label,
  value,
  onChange,
  placeholder = "",
  error = false,
  helperText = "",
  disabled = false,
  required = false,
  fullWidth = false,
  variant = "outlined", // outlined, filled, standard
  min,
  max,
  step = 1,
  decimals,
  integerOnly = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const variantStyles = {
    outlined: `border ${error ? "border-red-500 focus:border-red-500" : "border-slate-300 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"} rounded-lg shadow-sm`,
    filled: `border ${error ? "border-red-500 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"} bg-slate-50 dark:bg-slate-900/60 rounded-lg shadow-sm`,
    standard: `border-b ${error ? "border-b-red-500" : "border-b-slate-300 dark:border-b-slate-700 focus:border-b-blue-500"}`,
  };

  const normalizeNumber = (rawValue) => {
    const asString = String(rawValue ?? "");
    const cleaned = asString.replace(/[^0-9.-]/g, "");

    // Allow intermediate typing states.
    if (
      cleaned === "" ||
      cleaned === "-" ||
      cleaned === "." ||
      cleaned === "-."
    ) {
      return cleaned;
    }

    if (integerOnly) {
      const intMatch = cleaned.match(/^-?\d+/);
      return intMatch ? intMatch[0] : "";
    }

    const decimalMatch = cleaned.match(/^-?\d*(?:\.\d*)?/)?.[0] ?? "";
    if (
      typeof decimals === "number" &&
      decimals >= 0 &&
      decimalMatch.includes(".")
    ) {
      const [whole, fraction = ""] = decimalMatch.split(".");
      return `${whole}.${fraction.slice(0, decimals)}`;
    }

    return decimalMatch;
  };

  const formatCommittedValue = (rawValue) => {
    const normalized = normalizeNumber(rawValue);
    if (
      normalized === "" ||
      normalized === "-" ||
      normalized === "." ||
      normalized === "-."
    ) {
      return "";
    }

    const parsed = Number(normalized);
    if (Number.isNaN(parsed)) return "";

    const clamped = Math.min(max ?? parsed, Math.max(min ?? parsed, parsed));

    if (integerOnly) return String(Math.trunc(clamped));
    if (typeof decimals === "number" && decimals >= 0)
      return clamped.toFixed(decimals);
    return String(clamped);
  };

  const emitValue = (nextValue) => {
    onChange({ target: { value: nextValue } });
  };

  const handleIncrement = () => {
    if (disabled) return;
    const currentValue = parseFloat(value) || 0;
    const newValue = currentValue + (step || 1);
    if (max === undefined || newValue <= max) {
      const emittedValue =
        typeof decimals === "number" && decimals >= 0
          ? newValue.toFixed(decimals)
          : newValue.toString();
      emitValue(
        integerOnly ? String(Math.trunc(Number(emittedValue))) : emittedValue,
      );
    }
  };

  const handleDecrement = () => {
    if (disabled) return;
    const currentValue = parseFloat(value) || 0;
    const newValue = currentValue - (step || 1);
    if (min === undefined || newValue >= min) {
      const emittedValue =
        typeof decimals === "number" && decimals >= 0
          ? newValue.toFixed(decimals)
          : newValue.toString();
      emitValue(
        integerOnly ? String(Math.trunc(Number(emittedValue))) : emittedValue,
      );
    }
  };

  const handleInputChange = (e) => {
    emitValue(normalizeNumber(e.target.value));
  };

  const handleBlur = () => {
    setIsFocused(false);
    emitValue(formatCommittedValue(value));
  };

  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? "w-full" : ""}`}>
      <div className="relative">
        {/* Label */}
        {label && (
          <label
            className={`absolute left-3 transition-all duration-200 pointer-events-none
              ${isFocused || value ? "text-xs -top-2.5 bg-white dark:bg-[#111318] px-1" : "text-sm top-1/2 -translate-y-1/2"}
              ${error ? "text-red-500" : isFocused ? "text-blue-600 dark:text-blue-300" : "text-slate-500 dark:text-slate-300"}
            `}
          >
            {label}
            {required && " *"}
          </label>
        )}

        {/* Custom Increment/Decrement Buttons */}
        <div className="absolute bottom-0 right-0 top-0 flex flex-col overflow-hidden border-l border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={handleIncrement}
            disabled={disabled}
            className="flex-1 px-2 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800"
          >
            <svg
              className="w-3 h-3 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
          <div className="h-px bg-slate-200 dark:bg-slate-700" />
          <button
            type="button"
            onClick={handleDecrement}
            disabled={disabled}
            className="flex-1 px-2 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800"
          >
            <svg
              className="w-3 h-3 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
        {/* Input - Hide default spinner */}
        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          step={step}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          className={`
            w-full pr-10 pl-3 text-sm
            ${label ? "py-4" : "py-3"}
            bg-white dark:bg-[#111318]
            text-slate-950 dark:text-white
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            outline-none
            transition-all duration-200
            ${variantStyles[variant]}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
          `}
        />
      </div>

      {/* Helper Text / Error Message */}
      {helperText && (
        <span
          className={`text-xs px-3 ${error ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
        >
          {helperText}
        </span>
      )}
    </div>
  );
};

export const SelectField = ({
  label,
  value,
  onChange,
  options = [], // Array of {value, label, image} objects
  error = false,
  helperText = "",
  disabled = false,
  required = false,
  allowAdd = false,
  onAdd = () => {},
  fullWidth = false,
  variant = "outlined",
  placeholder = "",
  searchable = false, // Enable search functionality
  multiple = false, // Enable multiple selection
  optionImageSize = "medium", // small, medium, large, xlarge
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({
    left: 0,
    top: 0,
    width: 0,
  });
  const selectButtonRef = useRef(null);
  const selectSearchRef = useRef(null);

  const variantStyles = {
    outlined: `border ${error ? "border-red-500" : isOpen ? "border-blue-500 dark:border-blue-400" : "border-slate-300 dark:border-slate-700"} rounded-lg shadow-sm`,
    filled: `border ${error ? "border-red-500" : isOpen ? "border-blue-500 dark:border-blue-400" : "border-slate-200 dark:border-slate-700"} bg-slate-50 dark:bg-slate-900/60 rounded-lg shadow-sm`,
    standard: `border-b ${error ? "border-b-red-500" : isOpen ? "border-b-blue-500" : "border-b-slate-300 dark:border-b-slate-700"}`,
  };

  const optionImageSizes = {
    small: "w-6 h-6",
    medium: "w-9 h-9",
    large: "w-12 h-12",
    xlarge: "w-16 h-16",
  };
  const selectedImageSizes = {
    small: "w-5 h-5",
    medium: "w-7 h-7",
    large: "w-9 h-9",
    xlarge: "w-12 h-12",
  };
  const selectImageHeights = {
    small: "min-h-14",
    medium: "min-h-16",
    large: "min-h-20",
    xlarge: "min-h-24",
  };
  const optionRowPadding = {
    small: "py-2",
    medium: "py-3",
    large: "py-3",
    xlarge: "py-4",
  };
  const imageSizeClass = optionImageSizes[optionImageSize] || optionImageSizes.medium;
  const selectedImageSizeClass =
    selectedImageSizes[optionImageSize] || selectedImageSizes.medium;
  const selectImageHeightClass =
    selectImageHeights[optionImageSize] || selectImageHeights.medium;
  const optionRowPaddingClass =
    optionRowPadding[optionImageSize] || optionRowPadding.medium;

  const getOptionImage = (option) => option?.image || option?.imageSrc || "";
  const hasOptionImages = options.some((option) => getOptionImage(option));

  const renderOptionImage = (option, sizeClass = imageSizeClass) => {
    const image = getOptionImage(option);

    if (!image) return null;

    return (
      <img
        src={image}
        alt={option?.imageAlt || option?.label || ""}
        className={`${sizeClass} rounded object-cover flex-shrink-0 bg-gray-100 dark:bg-gray-800`}
        loading="lazy"
      />
    );
  };

  // Filter options based on search query
  const filteredOptions =
    searchable && searchQuery
      ? options.filter((opt) =>
          String(opt.label).toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : options;

  // Handle single/multiple value
  const valueArray = multiple ? (Array.isArray(value) ? value : []) : [];
  const selectedOption = !multiple
    ? options.find((opt) => opt.value === value)
    : null;
  const selectedOptions = multiple
    ? options.filter((opt) => valueArray.includes(opt.value))
    : [];

  // Check if label should float
  const hasValue = multiple ? valueArray.length > 0 : Boolean(value);

  const handleSelect = (optionValue) => {
    if (multiple) {
      // Toggle selection for multiple mode
      const newValue = valueArray.includes(optionValue)
        ? valueArray.filter((v) => v !== optionValue)
        : [...valueArray, optionValue];
      onChange({ target: { value: newValue } });
      if (searchable) {
        requestAnimationFrame(() => selectSearchRef.current?.focus());
      }
    } else {
      // Single selection
      onChange({ target: { value: optionValue } });
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  const handleRemoveChip = (optionValue, e) => {
    e.stopPropagation();
    e.preventDefault();
    const newValue = valueArray.filter((v) => v !== optionValue);
    onChange({ target: { value: newValue } });
  };

  const updateDropdownPosition = () => {
    if (selectButtonRef.current) {
      const rect = selectButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        left: rect.left,
        top: rect.bottom,
        width: rect.width,
      });
    }
  };

  const handleOpen = () => {
    if (!isOpen) {
      updateDropdownPosition();
      setSearchQuery("");
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!isOpen || !searchable) return;
    requestAnimationFrame(() => selectSearchRef.current?.focus());
  }, [isOpen, searchable]);

  // Update position on scroll/resize when open
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      const handleUpdate = () => updateDropdownPosition();
      window.addEventListener("scroll", handleUpdate, true);
      window.addEventListener("resize", handleUpdate);
      return () => {
        window.removeEventListener("scroll", handleUpdate, true);
        window.removeEventListener("resize", handleUpdate);
      };
    }
  }, [isOpen]);

  const isSelected = (optionValue) => {
    return multiple ? valueArray.includes(optionValue) : value === optionValue;
  };

  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? "w-full" : ""}`}>
      <div className="relative">
        {/* Label */}
        {label && (
          <label
            className={`absolute left-3 transition-all duration-200 pointer-events-none z-10
              ${hasValue || isOpen ? "text-xs -top-2.5 bg-white dark:bg-[#111318] px-1" : "text-sm top-1/2 -translate-y-1/2"}
              ${error ? "text-red-500" : isOpen ? "text-blue-600 dark:text-blue-300" : "text-slate-500 dark:text-slate-300"}
            `}
          >
            {label}
            {required && " *"}
          </label>
        )}

        {/* Select Button */}
        <button
          ref={selectButtonRef}
          type="button"
          disabled={disabled}
          onClick={handleOpen}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-3 text-sm text-left flex items-center justify-between gap-2
            ${hasOptionImages ? `${selectImageHeightClass} py-2` : label ? "min-h-14 py-2" : "py-3"}
            bg-white dark:bg-[#111318]
            outline-none
            transition-all duration-200
            ${variantStyles[variant]}
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <div className="flex-1 flex flex-wrap gap-1 items-center">
            {multiple && hasValue ? (
              selectedOptions.map((opt) => (
                <div
                  key={opt.value}
                  className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/15 dark:text-blue-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  {renderOptionImage(opt, "w-5 h-5")}
                  <span>{opt.label}</span>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveChip(opt.value, e)}
                    className="rounded-full p-0.5 transition-colors hover:bg-blue-100 dark:hover:bg-blue-500/20"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <span
                className={`inline-flex min-w-0 items-center gap-2 ${hasValue ? "text-slate-950 dark:text-white" : "text-slate-400 dark:text-slate-500"}`}
              >
                {!multiple && selectedOption ? (
                  <>
                    {renderOptionImage(selectedOption, selectedImageSizeClass)}
                    <span className="truncate">{selectedOption.label}</span>
                  </>
                ) : (
                  placeholder
                )}
              </span>
            )}
          </div>
          <svg
            className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 dark:text-slate-400 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen &&
          !disabled &&
          createPortal(
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-9998"
                onClick={() => {
                  setIsOpen(false);
                  setSearchQuery("");
                }}
              />

              {/* Options List */}
              <div
                className="fixed z-9999 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 dark:border-slate-700 dark:bg-[#171a21] dark:shadow-black/40"
                style={{
                  left: `${dropdownPosition.left}px`,
                  top: `${dropdownPosition.top}px`,
                  width: `${dropdownPosition.width}px`,
                  maxHeight: "240px",
                  overflowY: "auto",
                }}
              >
                {/* Search Input (only if searchable) */}
                {searchable && (
                  <div className="sticky top-0 flex items-center gap-2 border-b border-slate-100 bg-white p-2 dark:border-slate-800 dark:bg-[#171a21]">
                    {/* Expands */}
                    <div className="relative flex-1 min-w-0">
                      <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>

                      <input
                        ref={selectSearchRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-950 outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-[#111318] dark:text-white dark:focus:border-blue-400"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Static size */}
                    {allowAdd && (
                      <div className="shrink-0">
                        <Button
                          type="button"
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setIsOpen(false);
                            onAdd?.(searchQuery);
                          }}
                        >
                          +
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Options Container */}
                <div>
                  {filteredOptions.length === 0 ? (
                    <div className="px-4 py-3">
                      <div className="text-sm text-gray-400 dark:text-gray-500">
                        {searchQuery
                          ? "No results found"
                          : "No options available"}
                      </div>
                    </div>
                  ) : (
                    filteredOptions.map((option) => (
                      <div
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className={`
                        flex cursor-pointer items-center gap-3 px-4 ${getOptionImage(option) ? optionRowPaddingClass : "py-3"} text-sm transition-colors duration-150
                        ${
                          isSelected(option.value)
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-100"
                            : "text-slate-900 hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800"
                        }
                      `}
                      >
                        {/* Checkbox for multiple selection */}
                        {multiple && (
                          <div
                            className={`w-4 h-4 border-2 rounded flex items-center justify-center flex-shrink-0 transition-colors
                          ${
                            isSelected(option.value)
                              ? "bg-blue-600 border-blue-600 dark:bg-blue-400 dark:border-blue-400"
                              : "border-slate-300 dark:border-slate-600"
                          }`}
                          >
                            {isSelected(option.value) && (
                              <svg
                                className="w-3 h-3 text-white dark:text-gray-900"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        )}
                        {renderOptionImage(option)}
                        <span className="flex-1">{option.label}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>,
            document.body,
          )}
      </div>

      {/* Helper Text / Error Message */}
      {helperText && (
        <span
          className={`text-xs px-3 ${error ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
        >
          {helperText}
        </span>
      )}
    </div>
  );
};

export const CheckboxField = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  error = false,
  helperText = "",
  name = "",
  required = false,
}) => {
  const checkboxId = `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  const handleClick = () => {
    if (!disabled) {
      onChange({ target: { checked: !checked } });
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center">
        <div className="flex items-center h-5">
          <input
            id={checkboxId}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            name={name}
            required={required}
            className="sr-only peer"
          />
          <div
            onClick={handleClick}
            className={`
              flex h-5 w-5 items-center justify-center rounded-md border-2 shadow-sm transition-all duration-200
              ${
                checked
                  ? "border-blue-600 bg-blue-600 dark:border-blue-400 dark:bg-blue-400"
                  : error
                    ? "border-red-500"
                    : "border-slate-300 bg-white hover:border-blue-500 dark:border-slate-600 dark:bg-[#111318] dark:hover:border-blue-400"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {checked && (
              <svg
                className="h-3.5 w-3.5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
        {label && (
          <div
            onClick={handleClick}
            className={`
              ml-3 text-sm select-none
              ${error ? "text-red-500" : "text-slate-900 dark:text-white"}
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {label}
            {required && " *"}
          </div>
        )}
      </div>

      {/* Helper Text / Error Message */}
      {helperText && (
        <span
          className={`text-xs px-3 ${error ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
        >
          {helperText}
        </span>
      )}
    </div>
  );
};

export const RadioField = ({
  label, // Group title
  value, // Selected value
  onChange,
  options = [], // Array of {value, label} objects
  disabled = false,
  error = false,
  helperText = "",
  name = "",
  required = false,
  row = false, // Layout: false = vertical (default), true = horizontal
}) => {
  return (
    <div className="flex flex-col gap-2">
      {/* Group Title */}
      {label && (
        <label
          className={`text-sm font-medium ${error ? "text-red-500" : "text-gray-900 dark:text-white"}`}
        >
          {label}
          {required && " *"}
        </label>
      )}

      {/* Radio Options */}
      <div
        className={`flex ${row ? "flex-row flex-wrap gap-4" : "flex-col gap-2"}`}
      >
        {options.map((option) => {
          const radioId = `radio-${name}-${option.value}`;
          const isSelected = value === option.value;
          const isDisabled = disabled || option.disabled;

          return (
            <div key={option.value} className="flex items-center">
              <div className="flex items-center h-5">
                <input
                  id={radioId}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  onChange={onChange}
                  disabled={isDisabled}
                  required={required}
                  className="sr-only"
                />
                <div
                  onClick={
                    isDisabled
                      ? undefined
                      : (e) => {
                          e.preventDefault();
                          onChange({ target: { value: option.value } });
                        }
                  }
                  className={`
                    flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white shadow-sm transition-all duration-200 dark:bg-[#111318]
                    ${
                      isSelected
                        ? "border-blue-600 dark:border-blue-400"
                        : error
                          ? "border-red-500"
                          : "border-slate-300 hover:border-blue-500 dark:border-slate-600 dark:hover:border-blue-400"
                    }
                    ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  {isSelected && (
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                  )}
                </div>
              </div>
              {option.label && (
                <div
                  onClick={
                    isDisabled
                      ? undefined
                      : (e) => {
                          e.preventDefault();
                          onChange({ target: { value: option.value } });
                        }
                  }
                  className={`
                    ml-3 text-sm select-none
                    ${error ? "text-red-500" : "text-slate-900 dark:text-white"}
                    ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  {option.label}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Helper Text / Error Message */}
      {helperText && (
        <span
          className={`text-xs ${error ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
        >
          {helperText}
        </span>
      )}
    </div>
  );
};

export const Button = ({
  children,
  onClick,
  type = "button", // button, submit, reset
  variant = "primary", // primary, secondary, outlined
  disabled = false,
  loading = false,
  fullWidth = false,
  size = "medium", // small, medium, large
  startIcon = null,
  endIcon = null,
  width = "auto",
  height = "auto",
  className = "",
  style = {},
  ...buttonProps
}) => {
  const cssSize = (value) => typeof value === "number" ? `${value}px` : value;
  const sizeStyles = {
    small: "px-3 py-1.5 text-xs",
    medium: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base",
    icon: "p-0 text-sm",
  };

  const variantStyles = {
    primary: `
      bg-blue-600 dark:bg-blue-500
      text-white dark:text-white
      border border-blue-600 dark:border-blue-400
      shadow-sm shadow-blue-600/20
      hover:bg-blue-700 dark:hover:bg-blue-400
      hover:border-blue-700 dark:hover:border-blue-300
      hover:shadow-md hover:shadow-blue-600/20
      active:bg-blue-800 dark:active:bg-blue-500
      disabled:bg-blue-300 dark:disabled:bg-blue-900/60
      disabled:border-blue-300 dark:disabled:border-blue-900/60
      disabled:text-white dark:disabled:text-blue-200
    `,
    secondary: `
      bg-white dark:bg-slate-800
      text-slate-700 dark:text-slate-100
      border border-slate-200 dark:border-slate-700
      shadow-sm
      hover:bg-slate-50 dark:hover:bg-slate-700
      hover:border-slate-300 dark:hover:border-slate-600
      active:bg-slate-100 dark:active:bg-slate-800
      disabled:bg-slate-100 dark:disabled:bg-slate-900
      disabled:text-slate-400 dark:disabled:text-slate-500
    `,
    outlined: `
      bg-white/70 dark:bg-transparent
      text-blue-700 dark:text-blue-300
      border border-blue-200 dark:border-blue-400/30
      shadow-sm
      hover:bg-blue-50 dark:hover:bg-blue-500/10
      hover:border-blue-300 dark:hover:border-blue-400/50
      active:bg-blue-100 dark:active:bg-blue-500/15
      disabled:border-slate-300 dark:disabled:border-slate-700
      disabled:text-slate-400 dark:disabled:text-slate-500
      disabled:bg-transparent
    `,
    ghost: `
      bg-transparent border-0
      text-slate-500 dark:text-slate-400
      hover:bg-blue-50 hover:text-blue-600
      dark:hover:bg-blue-500/10 dark:hover:text-blue-300
      disabled:text-slate-300 dark:disabled:text-slate-600
    `,
  };

  return (
    <button
      {...buttonProps}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{ ...style, width: cssSize(width), height: cssSize(height) }}
      className={`
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${fullWidth ? "w-full" : ""}
        font-semibold rounded-lg
        transition-all duration-200 focus:ring-4 focus:ring-blue-500/15
        disabled:cursor-not-allowed disabled:opacity-60
        flex items-center justify-center gap-2
        ${disabled ? "" : "cursor-pointer"}
        ${className}
      `}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          <span>Processing...</span>
        </span>
      ) : (
        <>
          {startIcon && <span className="flex items-center">{startIcon}</span>}
          {children}
          {endIcon && <span className="flex items-center">{endIcon}</span>}
        </>
      )}
    </button>
  );
};

export const TextAreaField = ({
  label,
  value,
  onChange,
  placeholder = "",
  error = false,
  helperText = "",
  disabled = false,
  required = false,
  fullWidth = false,
  variant = "outlined", // outlined, filled, standard
  rows = 4,
  resize = "vertical", // none, both, horizontal, vertical
  maxLength = null,
  showCharCount = false,
  richText = false, // Enable rich text editor
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const variantStyles = {
    outlined: `border ${error ? "border-red-500 focus:border-red-500" : "border-slate-300 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"} rounded-lg shadow-sm`,
    filled: `border ${error ? "border-red-500 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"} bg-slate-50 dark:bg-slate-900/60 rounded-lg shadow-sm`,
    standard: `border-b ${error ? "border-b-red-500" : "border-b-slate-300 dark:border-b-slate-700 focus:border-b-blue-500"}`,
  };

  const resizeStyles = {
    none: "resize-none",
    both: "resize",
    horizontal: "resize-x",
    vertical: "resize-y",
  };

  const editorRef = useRef(null);

  const applyFormat = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
    }
  };

  const handleRichTextChange = (e) => {
    const content = e.currentTarget.innerHTML;
    onChange({ target: { value: content } });
  };

  // Set initial content for rich text editor
  useEffect(() => {
    if (
      richText &&
      editorRef.current &&
      editorRef.current.innerHTML !== value
    ) {
      const selection = window.getSelection();
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      const cursorPosition = range ? range.startOffset : 0;
      const activeElement = document.activeElement;

      // Only update if not currently focused to avoid cursor jumping
      if (activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value, richText]);

  if (richText) {
    return (
      <div className={`flex flex-col gap-1 ${fullWidth ? "w-full" : ""}`}>
        <div className="relative">
          {/* Label */}
          {label && (
            <label
              className={`block mb-2 text-sm font-medium
                ${error ? "text-red-500" : "text-gray-900 dark:text-white"}
              `}
            >
              {label}
              {required && " *"}
            </label>
          )}

          {/* Rich Text Toolbar */}
          {!disabled && (
            <div className="mb-2 flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-slate-50 p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormat("bold");
                }}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title="Bold"
              >
                <svg
                  className="w-4 h-4 text-gray-700 dark:text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M11 5H7v2h4V5zm0 4H7v2h4V9zm2 0c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h7c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2zm0 4H7v-2h6v2z" />
                </svg>
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormat("italic");
                }}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title="Italic"
              >
                <svg
                  className="w-4 h-4 text-gray-700 dark:text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z" />
                </svg>
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormat("underline");
                }}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title="Underline"
              >
                <svg
                  className="w-4 h-4 text-gray-700 dark:text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2a5 5 0 00-5 5v5a5 5 0 0010 0V7a5 5 0 00-5-5zm3 10a3 3 0 11-6 0V7a3 3 0 116 0v5zM4 16h12v2H4v-2z" />
                </svg>
              </button>
              <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormat("insertUnorderedList");
                }}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title="Bullet List"
              >
                <svg
                  className="w-4 h-4 text-gray-700 dark:text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 4h2v2H4V4zm4 0h8v2H8V4zM4 9h2v2H4V9zm4 0h8v2H8V9zm-4 5h2v2H4v-2zm4 0h8v2H8v-2z" />
                </svg>
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormat("insertOrderedList");
                }}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title="Numbered List"
              >
                <svg
                  className="w-4 h-4 text-gray-700 dark:text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5 4v2H3V4h2zm0 5v2H3V9h2zm0 5v2H3v-2h2zM8 4h8v2H8V4zm0 5h8v2H8V9zm0 5h8v2H8v-2z" />
                </svg>
              </button>
              <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormat("justifyLeft");
                }}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title="Align Left"
              >
                <svg
                  className="w-4 h-4 text-gray-700 dark:text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4h14v2H3V4zm0 4h10v2H3V8zm0 4h14v2H3v-2zm0 4h10v2H3v-2z" />
                </svg>
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormat("justifyCenter");
                }}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title="Align Center"
              >
                <svg
                  className="w-4 h-4 text-gray-700 dark:text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4h14v2H3V4zm3 4h8v2H6V8zm-3 4h14v2H3v-2zm3 4h8v2H6v-2z" />
                </svg>
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormat("justifyRight");
                }}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title="Align Right"
              >
                <svg
                  className="w-4 h-4 text-gray-700 dark:text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4h14v2H3V4zm4 4h10v2H7V8zm-4 4h14v2H3v-2zm4 4h10v2H7v-2z" />
                </svg>
              </button>
            </div>
          )}

          {/* Rich Text Editor */}
          <div
            ref={editorRef}
            contentEditable={!disabled}
            onInput={handleRichTextChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            suppressContentEditableWarning
            className={`
              w-full px-3 py-3 text-sm
              bg-white dark:bg-[#111318]
              text-slate-950 dark:text-white
              outline-none
              transition-all duration-200
              overflow-y-auto
              ${variantStyles[variant]}
              ${disabled ? "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900" : ""}
              ${resizeStyles[resize]}
            `}
            style={{ minHeight: `${rows * 1.5}rem` }}
          />
        </div>

        {/* Helper Text / Error Message */}
        {helperText && (
          <span
            className={`text-xs px-3 ${error ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
          >
            {helperText}
          </span>
        )}
      </div>
    );
  }

  // Simple textarea
  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? "w-full" : ""}`}>
      <div className="relative">
        {/* Label */}
        {label && (
          <label
            className={`absolute left-3 transition-all duration-200 pointer-events-none z-10
              ${isFocused || value ? "text-xs -top-2.5 bg-white dark:bg-[#111318] px-1" : "text-sm top-3"}
              ${error ? "text-red-500" : isFocused ? "text-blue-600 dark:text-blue-300" : "text-slate-500 dark:text-slate-300"}
            `}
          >
            {label}
            {required && " *"}
          </label>
        )}

        {/* Textarea */}
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-3 text-sm
            ${label ? "pt-6 pb-3" : "py-3"}
            bg-white dark:bg-[#111318]
            text-slate-950 dark:text-white
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            outline-none
            transition-all duration-200
            ${variantStyles[variant]}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${resizeStyles[resize]}
          `}
        />
      </div>

      {/* Character Count / Helper Text */}
      <div className="flex justify-between items-center px-3">
        {helperText && (
          <span
            className={`text-xs ${error ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
          >
            {helperText}
          </span>
        )}
        {showCharCount && maxLength && (
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
            {value?.length || 0} / {maxLength}
          </span>
        )}
      </div>
    </div>
  );
};

export const ToggleSwitch = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  size = "medium", // small, medium, large
  leftIcon = null, // Icon for unchecked state
  rightIcon = null, // Icon for checked state
  leftLabel = "", // Label for unchecked state
  rightLabel = "", // Label for checked state
  helperText = "",
  checkedColor = "#3B82F6",
  uncheckedColor = "#6B7280",
}) => {
  const sizeStyles = {
    small: {
      switch: "w-9 h-5",
      thumb: "w-4 h-4 top-0.5 left-0.5",
      translate: "translateX(16px)",
      icon: "w-2.5 h-2.5",
    },
    medium: {
      switch: "w-12 h-6",
      thumb: "w-5 h-5 top-0.5 left-0.5",
      translate: "translateX(24px)",
      icon: "w-3 h-3",
    },
    large: {
      switch: "w-14 h-7",
      thumb: "w-6 h-6 top-0.5 left-0.5",
      translate: "translateX(28px)",
      icon: "w-3.5 h-3.5",
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {/* Left Label */}
        {leftLabel && (
          <span
            className={`text-sm ${!checked ? "text-gray-900 dark:text-white font-medium" : "text-gray-500 dark:text-gray-400"}`}
          >
            {leftLabel}
          </span>
        )}

        {/* Main Label */}
        {label && !leftLabel && !rightLabel && (
          <label className="text-sm font-medium text-slate-900 dark:text-white">
            {label}
          </label>
        )}

        {/* Toggle Switch */}
        <button
          type="button"
          onClick={() =>
            !disabled && onChange({ target: { checked: !checked } })
          }
          disabled={disabled}
          className={`relative ${currentSize.switch} rounded-full shadow-inner ring-1 ring-black/5 transition-all duration-300 dark:ring-white/10 ${
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
          style={{ backgroundColor: checked ? checkedColor : uncheckedColor }}
        >
          <div
            className={`absolute ${currentSize.thumb} flex items-center justify-center rounded-full bg-white shadow-md shadow-slate-900/20 transition-transform duration-300`}
            style={{
              transform: checked ? currentSize.translate : "translateX(0)",
            }}
          >
            {/* Icons */}
            {checked && rightIcon && (
              <span className={currentSize.icon}>{rightIcon}</span>
            )}
            {!checked && leftIcon && (
              <span className={currentSize.icon}>{leftIcon}</span>
            )}
          </div>
        </button>

        {/* Right Label */}
        {rightLabel && (
          <span
            className={`text-sm ${checked ? "font-medium text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}
          >
            {rightLabel}
          </span>
        )}
      </div>

      {/* Helper Text */}
      {helperText && (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {helperText}
        </span>
      )}
    </div>
  );
};

// ─── CategoryTreeField ────────────────────────────────────────────────────────
//
//  Props
//  ─────
//  items        {Array}     Flat list of category objects: { id, name, parent_id }
//  value        {Array}     Controlled array of selected category IDs (strings).
//  onChange     {Function}  (ids[]) => void
//  label        {string}    Label shown above the component.
//  placeholder  {string}    Text for the collapsed trigger button.
//  searchable   {boolean}   Show a search input inside the tree. Default: true
//  maxHeight    {string}    CSS max-height of the scrollable tree. Default: '280px'
//  fullWidth    {boolean}   Expand to container width.
//  error        {boolean}
//  helperText   {string}
//
//  Behaviour
//  ─────────
//  • Checking a node cascades DOWN  — all descendants are selected.
//  • Checking a node bubbles UP     — all ancestors are selected.
//  • Unchecking a node cascades DOWN — all descendants are deselected.
//  • A parent shows an indeterminate checkbox when only some children are selected.

export const CategoryTreeField = ({
  items = [],
  value = [],
  onChange,
  label,
  placeholder = null,
  searchable = true,
  maxHeight = "280px",
  fullWidth = false,
  error = false,
  helperText = "",
  required = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const [summaryText, setSummaryText] = useState("");
  const containerRef = useRef(null);
  const triggerContentRef = useRef(null);
  const categorySearchRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open || !searchable) return;
    requestAnimationFrame(() => categorySearchRef.current?.focus());
  }, [open, searchable]);

  const nodeMap = useMemo(() => {
    const m = {};
    items.forEach((item) => {
      m[String(item.id)] = {
        ...item,
        id: String(item.id),
        parent_id: item.parent_id ? String(item.parent_id) : null,
      };
    });
    return m;
  }, [items]);

  const childrenMap = useMemo(() => {
    const m = {};
    Object.values(nodeMap).forEach((node) => {
      const pid = node.parent_id ?? "__root__";
      if (!m[pid]) m[pid] = [];
      m[pid].push(node.id);
    });
    return m;
  }, [nodeMap]);

  const roots = childrenMap["__root__"] || [];

  const selectedLabels = useMemo(() => {
    return value.map((id) => nodeMap[id]?.name).filter(Boolean);
  }, [value, nodeMap]);

  useLayoutEffect(() => {
    const contentEl = triggerContentRef.current;
    if (!contentEl) return;

    const updateSummary = () => {
      if (!selectedLabels.length) {
        setSummaryText("");
        return;
      }

      const availableWidth = contentEl.clientWidth;
      if (!availableWidth) {
        setSummaryText(selectedLabels.join(", "));
        return;
      }

      const styles = window.getComputedStyle(contentEl);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        setSummaryText(selectedLabels.join(", "));
        return;
      }

      context.font = `${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;

      let bestText = selectedLabels.join(", ");
      for (
        let visibleCount = 1;
        visibleCount <= selectedLabels.length;
        visibleCount++
      ) {
        const remaining = selectedLabels.length - visibleCount;
        const candidateText = `${selectedLabels.slice(0, visibleCount).join(", ")}${remaining > 0 ? ` +${remaining} more` : ""}`;
        if (context.measureText(candidateText).width <= availableWidth)
          bestText = candidateText;
        else break;
      }

      if (context.measureText(bestText).width > availableWidth) {
        setSummaryText(`${selectedLabels.length} selected`);
        return;
      }
      setSummaryText(bestText);
    };

    updateSummary();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updateSummary);
    observer.observe(contentEl);
    return () => observer.disconnect();
  }, [selectedLabels]);

  const handleToggle = (id) => {
    const selectedSet = new Set(value);
    if (selectedSet.has(id)) selectedSet.delete(id);
    else selectedSet.add(id);
    onChange([...selectedSet]);
  };

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const q = search.trim().toLowerCase();
  const matchesSearch = (id) => {
    if (!q) return true;
    if (nodeMap[id]?.name.toLowerCase().includes(q)) return true;
    return (childrenMap[id] || []).some((child) => matchesSearch(child));
  };

  const TreeNode = ({ id, depth = 0 }) => {
    if (!nodeMap[id] || !matchesSearch(id)) return null;
    const node = nodeMap[id];
    const children = (childrenMap[id] || []).filter((c) => matchesSearch(c));
    const hasChildren = children.length > 0;
    const isChecked = value.includes(id);
    const isExpanded = q
      ? true
      : expanded[id] !== false && (depth < 2 || expanded[id] === true);

    return (
      <div>
        <div
          className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer group"
          style={{ paddingLeft: `${8 + depth * 18}px` }}
          onClick={() => handleToggle(id)}
        >
          {/* Expand / collapse arrow */}
          <button
            type="button"
            onClick={(e) =>
              hasChildren ? toggleExpand(id, e) : e.stopPropagation()
            }
            className={`flex-shrink-0 w-4 h-4 flex items-center justify-center rounded text-gray-400 dark:text-gray-500 transition-transform ${isExpanded ? "rotate-90" : ""} ${hasChildren ? "hover:text-gray-600 dark:hover:text-gray-300" : "invisible"}`}
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Checkbox */}
          <div
            className={`flex-shrink-0 w-4 h-4 border-2 rounded flex items-center justify-center transition-all duration-150
              ${
                isChecked
                  ? "bg-blue-600 dark:bg-white border-blue-600 dark:border-white"
                  : "border-gray-300 dark:border-gray-600 group-hover:border-blue-400 dark:group-hover:border-blue-500"
              }`}
          >
            {isChecked && (
              <svg
                className="w-2.5 h-2.5 text-white dark:text-gray-900"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>

          {/* Label */}
          <span className="text-sm text-gray-800 dark:text-gray-200 select-none truncate flex-1">
            {node.name}
          </span>

          {/* Child count badge */}
          {hasChildren && (
            <span className="flex-shrink-0 text-[10px] text-gray-400 dark:text-gray-500">
              {children.length}
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div>
            {children.map((childId) => (
              <TreeNode key={childId} id={childId} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col gap-1 ${fullWidth ? "w-full" : ""}`}
    >
      <div className="relative">
        {label && (
          <label
            className={`absolute left-3 transition-all duration-200 pointer-events-none z-10
              ${value.length || open ? "text-xs -top-2.5 bg-white dark:bg-[#18181B] px-1" : "text-sm top-1/2 -translate-y-1/2"}
              ${error ? "text-red-500" : open ? "text-blue-600 dark:text-white" : "text-gray-600 dark:text-white"}
            `}
          >
            {label}
            {required && " *"}
          </label>
        )}

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`w-full px-3 text-sm text-left flex items-center justify-between gap-2 bg-transparent border rounded transition-colors
            ${label ? "min-h-14 py-2" : "py-3"}
            ${
              error
                ? "border-red-500"
                : open
                  ? "border-blue-600 dark:border-white"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
        >
          <span
            ref={triggerContentRef}
            className={`flex-1 truncate ${value.length ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}
          >
            {value.length
              ? summaryText || selectedLabels.join(", ")
              : placeholder}
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-md shadow-lg bg-white dark:bg-[#212125] overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-gray-100 dark:border-gray-700">
              <div className="relative">
                <svg
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  ref={categorySearchRef}
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search categories…"
                  className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-[#18181B] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded outline-none focus:border-blue-500 dark:focus:border-blue-400"
                  onClick={(e) => e.stopPropagation()}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="overflow-y-auto py-1" style={{ maxHeight }}>
            {roots.length === 0 ? (
              <p className="px-4 py-6 text-sm text-center text-gray-400 dark:text-gray-500">
                {items.length === 0
                  ? "No categories available"
                  : "No categories match your search"}
              </p>
            ) : (
              roots
                .filter((id) => matchesSearch(id))
                .map((id) => <TreeNode key={id} id={id} depth={0} />)
            )}
          </div>

          {value.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {value.length} selected
              </span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

      {helperText && (
        <span
          className={`text-xs px-1 ${error ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
        >
          {helperText}
        </span>
      )}
    </div>
  );
};

// export const CategoryTreeField = ({
//   items        = [],
//   value        = [],
//   onChange,
//   label,
//   placeholder  = null,
//   searchable   = true,
//   maxHeight    = '280px',
//   fullWidth    = false,
//   error        = false,
//   helperText   = '',
//   required = false
// }) => {
//   const [open, setOpen]           = useState(false)
//   const [search, setSearch]       = useState('')
//   const [expanded, setExpanded]   = useState({})
//   const [summaryText, setSummaryText] = useState('')
//   const containerRef              = useRef(null)
//   const triggerContentRef         = useRef(null)

//   // ── Close on outside click ─────────────────────────────────────────────────
//   useEffect(() => {
//     if (!open) return
//     const handler = (e) => {
//       if (containerRef.current && !containerRef.current.contains(e.target))
//         setOpen(false)
//     }
//     document.addEventListener('mousedown', handler)
//     return () => document.removeEventListener('mousedown', handler)
//   }, [open])

//   // ── Build id→node map + children map ──────────────────────────────────────
//   const nodeMap = useMemo(() => {
//     const m = {}
//     items.forEach(item => { m[String(item.id)] = { ...item, id: String(item.id), parent_id: item.parent_id ? String(item.parent_id) : null } })
//     return m
//   }, [items])

//   const childrenMap = useMemo(() => {
//     const m = {}
//     Object.values(nodeMap).forEach(node => {
//       const pid = node.parent_id ?? '__root__'
//       if (!m[pid]) m[pid] = []
//       m[pid].push(node.id)
//     })
//     return m
//   }, [nodeMap])

//   const roots = childrenMap['__root__'] || []

//   const selectedLabels = useMemo(() => {
//     return value
//       .map(id => nodeMap[id]?.name)
//       .filter(Boolean)
//   }, [value, nodeMap])

//   useLayoutEffect(() => {
//     const contentEl = triggerContentRef.current
//     if (!contentEl) return

//     const updateSummary = () => {
//       if (!selectedLabels.length) {
//         setSummaryText('')
//         return
//       }

//       const availableWidth = contentEl.clientWidth
//       if (!availableWidth) {
//         setSummaryText(selectedLabels.join(', '))
//         return
//       }

//       const styles = window.getComputedStyle(contentEl)
//       const canvas = document.createElement('canvas')
//       const context = canvas.getContext('2d')

//       if (!context) {
//         setSummaryText(selectedLabels.join(', '))
//         return
//       }

//       context.font = `${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`

//       let bestText = selectedLabels.join(', ')

//       for (let visibleCount = 1; visibleCount <= selectedLabels.length; visibleCount += 1) {
//         const remainingCount = selectedLabels.length - visibleCount
//         const candidateText = `${selectedLabels.slice(0, visibleCount).join(', ')}${remainingCount > 0 ? ` +${remainingCount} more` : ''}`

//         if (context.measureText(candidateText).width <= availableWidth) {
//           bestText = candidateText
//         } else {
//           break
//         }
//       }

//       if (context.measureText(bestText).width > availableWidth) {
//         setSummaryText(`${selectedLabels.length} selected`)
//         return
//       }

//       setSummaryText(bestText)
//     }

//     updateSummary()

//     if (typeof ResizeObserver === 'undefined') return

//     const observer = new ResizeObserver(updateSummary)
//     observer.observe(contentEl)

//     return () => observer.disconnect()
//   }, [selectedLabels])

//   // ── Helpers ────────────────────────────────────────────────────────────────
//   // Collect all descendant IDs (inclusive)
//   const getAllDescendants = (id) => {
//     const result = [id]
//     const stack  = [id]
//     while (stack.length) {
//       const cur = stack.pop()
//       ;(childrenMap[cur] || []).forEach(child => { result.push(child); stack.push(child) })
//     }
//     return result
//   }

//   // Collect all ancestor IDs (exclusive of self)
//   const getAllAncestors = (id) => {
//     const result = []
//     let cur = nodeMap[id]?.parent_id
//     while (cur) { result.push(cur); cur = nodeMap[cur]?.parent_id }
//     return result
//   }

//   // Check state for a node: 'checked' | 'indeterminate' | 'unchecked'
//   const getCheckState = (id) => {
//     const descendants = getAllDescendants(id)
//     const selectedSet = new Set(value)
//     const checkedCount = descendants.filter(d => selectedSet.has(d)).length
//     if (checkedCount === 0) return 'unchecked'
//     if (checkedCount === descendants.length) return 'checked'
//     return 'indeterminate'
//   }

//   // ── Toggle handler ─────────────────────────────────────────────────────────
//   const handleToggle = (id) => {
//     const selectedSet  = new Set(value)
//     const descendants  = getAllDescendants(id)
//     const isChecked    = getCheckState(id) === 'checked'

//     if (isChecked) {
//       // Uncheck: remove this node + all descendants
//       descendants.forEach(d => selectedSet.delete(d))
//     } else {
//       // Check: add this node + all descendants + all ancestors
//       descendants.forEach(d => selectedSet.add(d))
//       getAllAncestors(id).forEach(a => selectedSet.add(a))
//     }

//     onChange([...selectedSet])
//   }

//   // ── Toggle expand ──────────────────────────────────────────────────────────
//   const toggleExpand = (id, e) => {
//     e.stopPropagation()
//     setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
//   }

//   // ── Search filter (matches self or any descendant name) ────────────────────
//   const q = search.trim().toLowerCase()
//   const matchesSearch = (id) => {
//     if (!q) return true
//     if (nodeMap[id]?.name.toLowerCase().includes(q)) return true
//     return (childrenMap[id] || []).some(child => matchesSearch(child))
//   }

//   // ── Recursive tree node ────────────────────────────────────────────────────
//   const TreeNode = ({ id, depth = 0 }) => {
//     if (!nodeMap[id] || !matchesSearch(id)) return null
//     const node        = nodeMap[id]
//     const children    = (childrenMap[id] || []).filter(c => matchesSearch(c))
//     const hasChildren = children.length > 0
//     const checkState  = getCheckState(id)
//     const isExpanded  = q ? true : (expanded[id] !== false && (depth < 2 || expanded[id] === true))

//     return (
//       <div>
//         <div
//           className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer group"
//           style={{ paddingLeft: `${8 + depth * 18}px` }}
//           onClick={() => handleToggle(id)}
//         >
//           {/* Expand / collapse arrow */}
//           <button
//             type="button"
//             onClick={(e) => hasChildren ? toggleExpand(id, e) : e.stopPropagation()}
//             className={`flex-shrink-0 w-4 h-4 flex items-center justify-center rounded text-gray-400 dark:text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''} ${hasChildren ? 'hover:text-gray-600 dark:hover:text-gray-300' : 'invisible'}`}
//           >
//             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//             </svg>
//           </button>

//           {/* Checkbox */}
//           <div
//             className={`flex-shrink-0 w-4 h-4 border-2 rounded flex items-center justify-center transition-all duration-150
//               ${checkState === 'checked'
//                 ? 'bg-blue-600 dark:bg-white border-blue-600 dark:border-white'
//                 : checkState === 'indeterminate'
//                   ? 'bg-blue-100 dark:bg-blue-900 border-blue-400 dark:border-blue-500'
//                   : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400 dark:group-hover:border-blue-500'
//               }`}
//           >
//             {checkState === 'checked' && (
//               <svg className="w-2.5 h-2.5 text-white dark:text-gray-900" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//               </svg>
//             )}
//             {checkState === 'indeterminate' && (
//               <div className="w-2 h-0.5 bg-blue-500 dark:bg-blue-400 rounded" />
//             )}
//           </div>

//           {/* Label */}
//           <span className="text-sm text-gray-800 dark:text-gray-200 select-none truncate flex-1">
//             {node.name}
//           </span>

//           {/* Child count badge */}
//           {hasChildren && (
//             <span className="flex-shrink-0 text-[10px] text-gray-400 dark:text-gray-500">
//               {children.length}
//             </span>
//           )}
//         </div>

//         {/* Children */}
//         {hasChildren && isExpanded && (
//           <div>
//             {children.map(childId => (
//               <TreeNode key={childId} id={childId} depth={depth + 1} />
//             ))}
//           </div>
//         )}
//       </div>
//     )
//   }

//   // ── Render ─────────────────────────────────────────────────────────────────
//   return (
//     <div ref={containerRef} className={`flex flex-col gap-1 ${fullWidth ? 'w-full' : ''}`}>
//       <div className="relative">
//         {label && (
//           <label
//             className={`absolute left-3 transition-all duration-200 pointer-events-none z-10
//               ${value.length || open ? 'text-xs -top-2.5 bg-white dark:bg-[#18181B] px-1' : 'text-sm top-1/2 -translate-y-1/2'}
//               ${error ? 'text-red-500' : open ? 'text-blue-600 dark:text-white' : 'text-gray-600 dark:text-white'}
//             `}
//           >
//             {label}{required && ' *'}
//           </label>
//         )}

//         {/* Trigger button */}
//         <button
//           type="button"
//           onClick={() => setOpen(o => !o)}
//           className={`w-full px-3 text-sm text-left flex items-center justify-between gap-2 bg-transparent border rounded transition-colors
//             ${label ? 'min-h-14 py-2' : 'py-3'}
//             ${error
//               ? 'border-red-500'
//               : open
//                 ? 'border-blue-600 dark:border-white'
//                 : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
//             }`}
//         >
//           <span ref={triggerContentRef} className={`flex-1 truncate ${value.length ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
//             {value.length
//               ? (summaryText || selectedLabels.join(', '))
//               : placeholder}
//           </span>
//           <div className="flex items-center gap-1.5 flex-shrink-0">
//             {value.length > 0 && (
//               <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-medium">
//                 {value.length}
//               </span>
//             )}
//             <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//             </svg>
//           </div>
//         </button>
//       </div>

//       {/* Dropdown */}
//       {open && (
//         <div className="border border-gray-200 dark:border-gray-700 rounded-md shadow-lg bg-white dark:bg-[#212125] overflow-hidden">

//           {/* Search */}
//           {searchable && (
//             <div className="p-2 border-b border-gray-100 dark:border-gray-700">
//               <div className="relative">
//                 <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                 </svg>
//                 <input
//                   autoFocus
//                   type="text"
//                   value={search}
//                   onChange={e => setSearch(e.target.value)}
//                   placeholder="Search categories…"
//                   className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-[#18181B] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded outline-none focus:border-blue-500 dark:focus:border-blue-400"
//                   onClick={e => e.stopPropagation()}
//                 />
//                 {search && (
//                   <button type="button" onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
//                     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Tree */}
//           <div className="overflow-y-auto py-1" style={{ maxHeight }}>
//             {roots.length === 0 ? (
//               <p className="px-4 py-6 text-sm text-center text-gray-400 dark:text-gray-500">
//                 {items.length === 0 ? 'No categories available' : 'No categories match your search'}
//               </p>
//             ) : (
//               roots.filter(id => matchesSearch(id)).map(id => (
//                 <TreeNode key={id} id={id} depth={0} />
//               ))
//             )}
//           </div>

//           {/* Footer */}
//           {value.length > 0 && (
//             <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
//               <span className="text-xs text-gray-500 dark:text-gray-400">{value.length} selected</span>
//               <button
//                 type="button"
//                 onClick={() => onChange([])}
//                 className="text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
//               >
//                 Clear all
//               </button>
//             </div>
//           )}
//         </div>
//       )}

//       {helperText && (
//         <span className={`text-xs px-1 ${error ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
//           {helperText}
//         </span>
//       )}
//     </div>
//   )
// }

// ─── PhoneField ───────────────────────────────────────────────────────────────
//
//  Props
//  ─────
//  label        {string}   Floating label text.
//  value        {string}   Full value: "<dialCode> <number>", e.g. "+94 712345678"
//  onChange     {Function} (fullValue: string) => void
//  placeholder  {string}   Placeholder for the number part.
//  error        {boolean}
//  helperText   {string}
//  disabled     {boolean}
//  required     {boolean}
//  fullWidth    {boolean}
//  defaultCode  {string}   Default dial code, e.g. "+1". Default: "+1"

const COUNTRY_CODES = [
  { code: "AF", name: "Afghanistan", dial: "+93" },
  { code: "AL", name: "Albania", dial: "+355" },
  { code: "DZ", name: "Algeria", dial: "+213" },
  { code: "AD", name: "Andorra", dial: "+376" },
  { code: "AO", name: "Angola", dial: "+244" },
  { code: "AG", name: "Antigua & Barbuda", dial: "+1268" },
  { code: "AR", name: "Argentina", dial: "+54" },
  { code: "AM", name: "Armenia", dial: "+374" },
  { code: "AU", name: "Australia", dial: "+61" },
  { code: "AT", name: "Austria", dial: "+43" },
  { code: "AZ", name: "Azerbaijan", dial: "+994" },
  { code: "BS", name: "Bahamas", dial: "+1242" },
  { code: "BH", name: "Bahrain", dial: "+973" },
  { code: "BD", name: "Bangladesh", dial: "+880" },
  { code: "BB", name: "Barbados", dial: "+1246" },
  { code: "BY", name: "Belarus", dial: "+375" },
  { code: "BE", name: "Belgium", dial: "+32" },
  { code: "BZ", name: "Belize", dial: "+501" },
  { code: "BJ", name: "Benin", dial: "+229" },
  { code: "BT", name: "Bhutan", dial: "+975" },
  { code: "BO", name: "Bolivia", dial: "+591" },
  { code: "BA", name: "Bosnia & Herzegovina", dial: "+387" },
  { code: "BW", name: "Botswana", dial: "+267" },
  { code: "BR", name: "Brazil", dial: "+55" },
  { code: "BN", name: "Brunei", dial: "+673" },
  { code: "BG", name: "Bulgaria", dial: "+359" },
  { code: "BF", name: "Burkina Faso", dial: "+226" },
  { code: "BI", name: "Burundi", dial: "+257" },
  { code: "CV", name: "Cabo Verde", dial: "+238" },
  { code: "KH", name: "Cambodia", dial: "+855" },
  { code: "CM", name: "Cameroon", dial: "+237" },
  { code: "CA", name: "Canada", dial: "+1" },
  { code: "CF", name: "Central African Republic", dial: "+236" },
  { code: "TD", name: "Chad", dial: "+235" },
  { code: "CL", name: "Chile", dial: "+56" },
  { code: "CN", name: "China", dial: "+86" },
  { code: "CO", name: "Colombia", dial: "+57" },
  { code: "KM", name: "Comoros", dial: "+269" },
  { code: "CD", name: "Congo (DRC)", dial: "+243" },
  { code: "CG", name: "Congo (Republic)", dial: "+242" },
  { code: "CR", name: "Costa Rica", dial: "+506" },
  { code: "CI", name: "Côte d'Ivoire", dial: "+225" },
  { code: "HR", name: "Croatia", dial: "+385" },
  { code: "CU", name: "Cuba", dial: "+53" },
  { code: "CY", name: "Cyprus", dial: "+357" },
  { code: "CZ", name: "Czech Republic", dial: "+420" },
  { code: "DK", name: "Denmark", dial: "+45" },
  { code: "DJ", name: "Djibouti", dial: "+253" },
  { code: "DM", name: "Dominica", dial: "+1767" },
  { code: "DO", name: "Dominican Republic", dial: "+1809" },
  { code: "EC", name: "Ecuador", dial: "+593" },
  { code: "EG", name: "Egypt", dial: "+20" },
  { code: "SV", name: "El Salvador", dial: "+503" },
  { code: "GQ", name: "Equatorial Guinea", dial: "+240" },
  { code: "ER", name: "Eritrea", dial: "+291" },
  { code: "EE", name: "Estonia", dial: "+372" },
  { code: "SZ", name: "Eswatini", dial: "+268" },
  { code: "ET", name: "Ethiopia", dial: "+251" },
  { code: "FJ", name: "Fiji", dial: "+679" },
  { code: "FI", name: "Finland", dial: "+358" },
  { code: "FR", name: "France", dial: "+33" },
  { code: "GA", name: "Gabon", dial: "+241" },
  { code: "GM", name: "Gambia", dial: "+220" },
  { code: "GE", name: "Georgia", dial: "+995" },
  { code: "DE", name: "Germany", dial: "+49" },
  { code: "GH", name: "Ghana", dial: "+233" },
  { code: "GR", name: "Greece", dial: "+30" },
  { code: "GD", name: "Grenada", dial: "+1473" },
  { code: "GT", name: "Guatemala", dial: "+502" },
  { code: "GN", name: "Guinea", dial: "+224" },
  { code: "GW", name: "Guinea-Bissau", dial: "+245" },
  { code: "GY", name: "Guyana", dial: "+592" },
  { code: "HT", name: "Haiti", dial: "+509" },
  { code: "HN", name: "Honduras", dial: "+504" },
  { code: "HU", name: "Hungary", dial: "+36" },
  { code: "IS", name: "Iceland", dial: "+354" },
  { code: "IN", name: "India", dial: "+91" },
  { code: "ID", name: "Indonesia", dial: "+62" },
  { code: "IR", name: "Iran", dial: "+98" },
  { code: "IQ", name: "Iraq", dial: "+964" },
  { code: "IE", name: "Ireland", dial: "+353" },
  { code: "IL", name: "Israel", dial: "+972" },
  { code: "IT", name: "Italy", dial: "+39" },
  { code: "JM", name: "Jamaica", dial: "+1876" },
  { code: "JP", name: "Japan", dial: "+81" },
  { code: "JO", name: "Jordan", dial: "+962" },
  { code: "KZ", name: "Kazakhstan", dial: "+7" },
  { code: "KE", name: "Kenya", dial: "+254" },
  { code: "KI", name: "Kiribati", dial: "+686" },
  { code: "KW", name: "Kuwait", dial: "+965" },
  { code: "KG", name: "Kyrgyzstan", dial: "+996" },
  { code: "LA", name: "Laos", dial: "+856" },
  { code: "LV", name: "Latvia", dial: "+371" },
  { code: "LB", name: "Lebanon", dial: "+961" },
  { code: "LS", name: "Lesotho", dial: "+266" },
  { code: "LR", name: "Liberia", dial: "+231" },
  { code: "LY", name: "Libya", dial: "+218" },
  { code: "LI", name: "Liechtenstein", dial: "+423" },
  { code: "LT", name: "Lithuania", dial: "+370" },
  { code: "LU", name: "Luxembourg", dial: "+352" },
  { code: "MG", name: "Madagascar", dial: "+261" },
  { code: "MW", name: "Malawi", dial: "+265" },
  { code: "MY", name: "Malaysia", dial: "+60" },
  { code: "MV", name: "Maldives", dial: "+960" },
  { code: "ML", name: "Mali", dial: "+223" },
  { code: "MT", name: "Malta", dial: "+356" },
  { code: "MH", name: "Marshall Islands", dial: "+692" },
  { code: "MR", name: "Mauritania", dial: "+222" },
  { code: "MU", name: "Mauritius", dial: "+230" },
  { code: "MX", name: "Mexico", dial: "+52" },
  { code: "FM", name: "Micronesia", dial: "+691" },
  { code: "MD", name: "Moldova", dial: "+373" },
  { code: "MC", name: "Monaco", dial: "+377" },
  { code: "MN", name: "Mongolia", dial: "+976" },
  { code: "ME", name: "Montenegro", dial: "+382" },
  { code: "MA", name: "Morocco", dial: "+212" },
  { code: "MZ", name: "Mozambique", dial: "+258" },
  { code: "MM", name: "Myanmar", dial: "+95" },
  { code: "NA", name: "Namibia", dial: "+264" },
  { code: "NR", name: "Nauru", dial: "+674" },
  { code: "NP", name: "Nepal", dial: "+977" },
  { code: "NL", name: "Netherlands", dial: "+31" },
  { code: "NZ", name: "New Zealand", dial: "+64" },
  { code: "NI", name: "Nicaragua", dial: "+505" },
  { code: "NE", name: "Niger", dial: "+227" },
  { code: "NG", name: "Nigeria", dial: "+234" },
  { code: "KP", name: "North Korea", dial: "+850" },
  { code: "MK", name: "North Macedonia", dial: "+389" },
  { code: "NO", name: "Norway", dial: "+47" },
  { code: "OM", name: "Oman", dial: "+968" },
  { code: "PK", name: "Pakistan", dial: "+92" },
  { code: "PW", name: "Palau", dial: "+680" },
  { code: "PA", name: "Panama", dial: "+507" },
  { code: "PG", name: "Papua New Guinea", dial: "+675" },
  { code: "PY", name: "Paraguay", dial: "+595" },
  { code: "PE", name: "Peru", dial: "+51" },
  { code: "PH", name: "Philippines", dial: "+63" },
  { code: "PL", name: "Poland", dial: "+48" },
  { code: "PT", name: "Portugal", dial: "+351" },
  { code: "QA", name: "Qatar", dial: "+974" },
  { code: "RO", name: "Romania", dial: "+40" },
  { code: "RU", name: "Russia", dial: "+7" },
  { code: "RW", name: "Rwanda", dial: "+250" },
  { code: "KN", name: "Saint Kitts & Nevis", dial: "+1869" },
  { code: "LC", name: "Saint Lucia", dial: "+1758" },
  { code: "VC", name: "Saint Vincent & Grenadines", dial: "+1784" },
  { code: "WS", name: "Samoa", dial: "+685" },
  { code: "SM", name: "San Marino", dial: "+378" },
  { code: "ST", name: "São Tomé & Príncipe", dial: "+239" },
  { code: "SA", name: "Saudi Arabia", dial: "+966" },
  { code: "SN", name: "Senegal", dial: "+221" },
  { code: "RS", name: "Serbia", dial: "+381" },
  { code: "SC", name: "Seychelles", dial: "+248" },
  { code: "SL", name: "Sierra Leone", dial: "+232" },
  { code: "SG", name: "Singapore", dial: "+65" },
  { code: "SK", name: "Slovakia", dial: "+421" },
  { code: "SI", name: "Slovenia", dial: "+386" },
  { code: "SB", name: "Solomon Islands", dial: "+677" },
  { code: "SO", name: "Somalia", dial: "+252" },
  { code: "ZA", name: "South Africa", dial: "+27" },
  { code: "KR", name: "South Korea", dial: "+82" },
  { code: "SS", name: "South Sudan", dial: "+211" },
  { code: "ES", name: "Spain", dial: "+34" },
  { code: "LK", name: "Sri Lanka", dial: "+94" },
  { code: "SD", name: "Sudan", dial: "+249" },
  { code: "SR", name: "Suriname", dial: "+597" },
  { code: "SE", name: "Sweden", dial: "+46" },
  { code: "CH", name: "Switzerland", dial: "+41" },
  { code: "SY", name: "Syria", dial: "+963" },
  { code: "TW", name: "Taiwan", dial: "+886" },
  { code: "TJ", name: "Tajikistan", dial: "+992" },
  { code: "TZ", name: "Tanzania", dial: "+255" },
  { code: "TH", name: "Thailand", dial: "+66" },
  { code: "TL", name: "Timor-Leste", dial: "+670" },
  { code: "TG", name: "Togo", dial: "+228" },
  { code: "TO", name: "Tonga", dial: "+676" },
  { code: "TT", name: "Trinidad & Tobago", dial: "+1868" },
  { code: "TN", name: "Tunisia", dial: "+216" },
  { code: "TR", name: "Turkey", dial: "+90" },
  { code: "TM", name: "Turkmenistan", dial: "+993" },
  { code: "TV", name: "Tuvalu", dial: "+688" },
  { code: "UG", name: "Uganda", dial: "+256" },
  { code: "UA", name: "Ukraine", dial: "+380" },
  { code: "AE", name: "United Arab Emirates", dial: "+971" },
  { code: "GB", name: "United Kingdom", dial: "+44" },
  { code: "US", name: "United States", dial: "+1" },
  { code: "UY", name: "Uruguay", dial: "+598" },
  { code: "UZ", name: "Uzbekistan", dial: "+998" },
  { code: "VU", name: "Vanuatu", dial: "+678" },
  { code: "VE", name: "Venezuela", dial: "+58" },
  { code: "VN", name: "Vietnam", dial: "+84" },
  { code: "YE", name: "Yemen", dial: "+967" },
  { code: "ZM", name: "Zambia", dial: "+260" },
  { code: "ZW", name: "Zimbabwe", dial: "+263" },
];

const CountryFlag = ({ code, name, className = "" }) => {
  if (!code) return null;

  const flagCode = code.toLowerCase();

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-sm bg-slate-100 ring-1 ring-slate-200 dark:bg-white/10 dark:ring-white/10 ${className}`}
      aria-hidden="true"
      title={name}
    >
      <img
        src={`https://flagcdn.com/w40/${flagCode}.png`}
        srcSet={`https://flagcdn.com/w80/${flagCode}.png 2x`}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover"
      />
    </span>
  );
};

export const PhoneField = ({
  label,
  value = "",
  onChange,
  placeholder = "Phone number",
  error = false,
  helperText = "",
  disabled = false,
  required = false,
  fullWidth = false,
  defaultCode = "+1",
}) => {
  // ── Parse stored value into dial code + number ─────────────────────────────
  const parseValue = (v) => {
    if (!v) return { dial: defaultCode, number: "" };

    // Try to match against known country codes (sorted by length, longest first)
    const sortedByLength = [...COUNTRY_CODES].sort(
      (a, b) => b.dial.length - a.dial.length,
    );
    for (const country of sortedByLength) {
      if (v.startsWith(country.dial)) {
        const rest = v.slice(country.dial.length).trim();
        return { dial: country.dial, number: rest };
      }
    }

    // Fallback: if value starts with +, treat first part as dial code
    const match = v.match(/^(\+\d+)\s?(.*)$/);
    if (match) return { dial: match[1], number: match[2] };

    return { dial: defaultCode, number: v };
  };

  const parsed = parseValue(value);
  const [dialCode, setDialCode] = useState(parsed.dial);
  const [number, setNumber] = useState(parsed.number);

  const [isFocused, setIsFocused] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Sync internal state when value prop changes externally
  useEffect(() => {
    const p = parseValue(value);
    if (p.dial !== dialCode) setDialCode(p.dial);
    if (p.number !== number) setNumber(p.number);
  }, [value]);

  // Emit combined value upward
  const emit = (dial, num) => {
    onChange?.(`${dial} ${num}`.trim());
  };

  const handleDialChange = (dial) => {
    setDialCode(dial);
    setDropOpen(false);
    setSearch("");
    emit(dial, number);
  };

  const handleNumberChange = (e) => {
    setNumber(e.target.value);
    emit(dialCode, e.target.value);
  };

  // ── Dropdown position via portal ───────────────────────────────────────────
  const openDrop = () => {
    if (disabled) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropHeight = 280;
      setDropPos({
        left: rect.left,
        width: rect.width,
        top:
          spaceBelow >= dropHeight
            ? rect.bottom + 4
            : rect.top - dropHeight - 4,
      });
    }
    setDropOpen(true);
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  useEffect(() => {
    if (!dropOpen) return;
    const close = (e) => {
      if (
        !triggerRef.current?.contains(e.target) &&
        !dropdownRef.current?.contains(e.target)
      ) {
        setDropOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [dropOpen]);

  const filtered = search.trim()
    ? COUNTRY_CODES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.dial.includes(search),
      )
    : COUNTRY_CODES;

  const selectedCountry =
    COUNTRY_CODES.find((c) => c.dial === dialCode) ?? null;
  const hasValue = dialCode || number;

  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? "w-full" : ""}`}>
      <div className="relative">
        {/* Floating label */}
        {label && (
          <label
            className={`absolute left-3 transition-all duration-200 pointer-events-none z-10
              ${isFocused || hasValue ? "text-xs -top-2.5 bg-white dark:bg-[#111318] px-1" : "text-sm top-1/2 -translate-y-1/2"}
              ${error ? "text-red-500" : isFocused ? "text-blue-600 dark:text-blue-300" : "text-slate-500 dark:text-slate-300"}
            `}
          >
            {label}
            {required && " *"}
          </label>
        )}

        {/* Combined input row */}
        <div
          className={`flex items-center rounded-lg border bg-white shadow-sm transition-all duration-200 dark:bg-[#111318]
            ${
              error
                ? "border-red-500"
                : isFocused
                  ? "border-blue-500 dark:border-blue-400"
                  : "border-slate-300 dark:border-slate-700"
            }
            ${disabled ? "opacity-50" : ""}
          `}
        >
          {/* Country code trigger */}
          <button
            ref={triggerRef}
            type="button"
            disabled={disabled}
            onClick={openDrop}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`flex h-full flex-shrink-0 items-center gap-1.5 border-r border-slate-200 px-2.5 dark:border-slate-700
              ${label ? "py-4" : "py-3"}
              bg-transparent text-sm text-slate-950 dark:text-white
              ${disabled ? "cursor-not-allowed" : "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"}
              transition-colors rounded-l-lg
            `}
          >
            {selectedCountry && (
              <CountryFlag
                code={selectedCountry.code}
                name={selectedCountry.name}
                className="h-4 w-6"
              />
            )}
            <span className="font-medium text-xs">{dialCode}</span>
            <svg
              className={`w-3 h-3 text-gray-400 transition-transform ${dropOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Number input */}
          <input
            type="tel"
            value={number}
            onChange={handleNumberChange}
            placeholder={isFocused || !label ? placeholder : ""}
            disabled={disabled}
            required={required}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`flex-1 bg-transparent px-3 text-sm text-slate-950 dark:text-white
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              outline-none
              ${label ? "py-4" : "py-3"}
              ${disabled ? "cursor-not-allowed" : ""}
            `}
          />
        </div>
      </div>

      {/* Dropdown portal */}
      {dropOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => {
                setDropOpen(false);
                setSearch("");
              }}
            />
            <div
              ref={dropdownRef}
              className="fixed z-[9999] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 dark:border-slate-700 dark:bg-[#171a21] dark:shadow-black/40"
              style={{
                top: dropPos.top,
                left: dropPos.left,
                width: Math.max(dropPos.width, 280),
              }}
            >
              {/* Search */}
              <div className="border-b border-slate-100 p-2 dark:border-slate-800">
                <div className="relative">
                  <svg
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search country or code…"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm text-slate-950 outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-[#111318] dark:text-white dark:focus:border-blue-400"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* List */}
              <div className="max-h-60 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="px-4 py-4 text-sm text-center text-gray-400">
                    No results
                  </p>
                ) : (
                  filtered.map((c) => (
                    <div
                      key={c.code}
                      onClick={() => handleDialChange(c.dial)}
                      className={`flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer transition-colors
                    ${
                      c.dial === dialCode
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-100"
                        : "text-slate-800 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                    >
                      <CountryFlag code={c.code} name={c.name} className="h-4 w-6" />
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {c.dial}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>,
          document.body,
        )}

      {helperText && (
        <span
          className={`text-xs px-3 ${error ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
        >
          {helperText}
        </span>
      )}
    </div>
  );
};
