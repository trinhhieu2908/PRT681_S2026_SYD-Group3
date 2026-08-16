import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Spinner } from "@/common/components/ui/spinner";
import { cn } from "@/common/utils";
import { Check, Edit, Pencil, X } from "lucide-react";
import { useState } from "react";

interface EditableStringValueProps {
  label?: string;
  initialValue: string;
  onSave: (newValue: string) => Promise<string> | Promise<void> | string | void;
  isLoading?: boolean;
  placeholder?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    required?: boolean;
    customValidator?: (value: string) => string | null;
  };
  className?: string;
  variant?: "filled" | "outlined" | "ghost";
  size?: "sm" | "md" | "lg";
  iconVariant?: "default" | "ghost";
}

export const EditableStringValue = ({
  label,
  initialValue: initialValueProp,
  onSave,
  isLoading = false,
  placeholder = `Enter ${label?.toLowerCase() || "value"}`,
  validation = {},
  className,
  variant = "filled",
  size = "md",
  iconVariant = "default",
}: EditableStringValueProps) => {
  const [initialValue, setInitialValue] = useState(initialValueProp);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(initialValueProp);
  const [error, setError] = useState<string | null>(null);

  const {
    minLength = 1,
    maxLength = 100,
    required = true,
    customValidator,
  } = validation;

  const handleStartEdit = () => {
    setEditValue(initialValue);
    setIsEditing(true);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditValue(initialValue);
    setIsEditing(false);
    setError(null);
  };

  const validateValue = (value: string): string | null => {
    // Custom validator first
    if (customValidator) {
      const customError = customValidator(value);
      if (customError) return customError;
    }

    // Required validation
    if (required && !value.trim()) {
      return `${label} is required`;
    }

    // Length validation
    if (value.trim().length < minLength) {
      return `${label} must be at least ${minLength} characters`;
    }

    if (value.trim().length > maxLength) {
      return `${label} must be less than ${maxLength} characters`;
    }

    return null;
  };

  const handleSaveEdit = async () => {
    const trimmedValue = editValue.trim();

    // No change check
    if (trimmedValue === initialValue) {
      setIsEditing(false);
      return;
    }

    // Validation
    const validationError = validateValue(trimmedValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      // Call the onSave callback (can be sync or async)
      const result = await onSave(trimmedValue);

      // Use the response value if provided, otherwise use the trimmed input value
      const updatedValue = typeof result === "string" ? result : trimmedValue;

      // On success, update state and exit edit mode
      setInitialValue(updatedValue);
      setEditValue(updatedValue);
      setIsEditing(false);
      setError(null);
    } catch (error) {
      setEditValue(initialValue);
      setIsEditing(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <div className="relative group">
        {!isEditing ? (
          // Display Mode
          <div
            className={cn(
              "flex items-center justify-between rounded-lg",
              variant === "filled" &&
                "bg-gray-50 border border-gray-200 py-1.5 px-3 hover:bg-gray-100 transition-colors",
              variant === "outlined" &&
                "bg-white border border-gray-200 py-1.5 px-3 hover:bg-gray-100 transition-colors",
              variant === "ghost" && "bg-transparent border-none px-1",
            )}
          >
            <span className="text-gray-900 flex-1 text-sm">{initialValue}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartEdit}
              className="ml-2 h-8 w-8 p-0"
              disabled={isLoading}
            >
              {iconVariant === "default" ? (
                <Edit className="w-4 h-4 text-gray-600" />
              ) : (
                <Pencil className="w-4 h-4 text-gray-600" />
              )}
            </Button>
          </div>
        ) : (
          // Edit Mode
          <div className="flex items-center gap-2">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className={cn(
                "flex-1",
                size === "sm" && "!h-8",
                size === "lg" && "!h-12",
                variant === "ghost" && "!px-1",
              )}
              placeholder={placeholder}
              autoFocus
              disabled={isLoading}
            />

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={
                  !editValue.trim() ||
                  editValue.trim() === initialValue ||
                  isLoading
                }
                className={cn(
                  "h-9 w-9 p-0 bg-green-600 hover:bg-green-700 text-white",
                  "disabled:bg-gray-300 disabled:cursor-not-allowed",
                  size === "sm" && "h-8 w-8",
                  size === "lg" && "h-10 w-10",
                )}
              >
                {isLoading ? (
                  <Spinner size="sm" className="w-4 h-4 border-t-green-600" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                disabled={isLoading}
                className={cn(
                  "h-9 w-9 p-0 border-gray-300 hover:bg-gray-50",
                  size === "sm" && "h-8 w-8",
                  size === "lg" && "h-10 w-10",
                )}
              >
                <X className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};
