import { Check, LoaderCircle, Pencil, Plus, X } from "lucide-react";
import {
  FormEvent,
  HTMLInputTypeAttribute,
  KeyboardEvent,
  ReactNode,
  useState,
} from "react";
import { Input } from "@/common/components/ui/input";
import { cn } from "@/common/utils/cn";

interface InlineEditableFieldProps {
  label: string;
  value: string | null;
  onSave: (value: string | null) => Promise<unknown>;
  validate: (value: string) => string | null;
  renderValue?: (value: string) => ReactNode;
  normalizeValue?: (value: string) => string | null;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  maxLength?: number;
  emptyActionLabel?: string;
  className?: string;
  displayClassName?: string;
  inputClassName?: string;
  disabled?: boolean;
}

const defaultNormalizeValue = (value: string) => {
  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
};

const InlineEditableField = ({
  label,
  value,
  onSave,
  validate,
  renderValue,
  normalizeValue = defaultNormalizeValue,
  type = "text",
  placeholder,
  maxLength,
  emptyActionLabel = "Add value",
  className,
  displayClassName,
  inputClassName,
  disabled = false,
}: InlineEditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(value ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startEditing = () => {
    setDraftValue(value ?? "");
    setError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraftValue(value ?? "");
    setError(null);
    setIsEditing(false);
  };

  const saveValue = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validate(draftValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    const normalizedValue = normalizeValue(draftValue);
    if (normalizedValue === value) {
      cancelEditing();
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSave(normalizedValue);
      setIsEditing(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : `Unable to update ${label.toLowerCase()}.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={saveValue} className={cn("min-w-0", className)}>
        <div className="flex min-w-0 items-center gap-2">
          <Input
            type={type}
            value={draftValue}
            onChange={(event) => {
              setDraftValue(event.target.value);
              if (error) {
                setError(null);
              }
            }}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled || isSubmitting}
            aria-label={label}
            aria-invalid={Boolean(error)}
            autoFocus
            className={cn(
              "min-w-0 flex-1 border-primary-300 bg-white focus-visible:ring-primary-500",
              inputClassName,
            )}
          />
          <button
            type="submit"
            disabled={disabled || isSubmitting}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Save ${label.toLowerCase()}`}
            title="Save"
          >
            {isSubmitting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={cancelEditing}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Cancel editing ${label.toLowerCase()}`}
            title="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-2 text-xs font-medium text-rose-600">
            {error}
          </p>
        )}
      </form>
    );
  }

  if (!value) {
    return (
      <div className={className}>
        <button
          type="button"
          onClick={startEditing}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-primary-300 bg-primary-50/60 px-3 py-2 text-sm font-semibold text-primary-700 transition hover:border-primary-400 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {emptyActionLabel}
        </button>
      </div>
    );
  }

  return (
    <div className={cn("group flex min-w-0 items-start gap-2", className)}>
      <div className={cn("min-w-0", displayClassName)}>
        {renderValue ? renderValue(value) : value}
      </div>
      <button
        type="button"
        onClick={startEditing}
        disabled={disabled}
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 opacity-70 transition hover:bg-primary-50 hover:text-primary-700 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={`Edit ${label.toLowerCase()}`}
        title={`Edit ${label.toLowerCase()}`}
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default InlineEditableField;
