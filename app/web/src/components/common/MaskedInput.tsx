import React, { type ChangeEvent } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { Input, type InputProps } from '../ui/Input';
import { formatCPF, formatPhone, unformatCPF, unformatPhone } from '../../utils/formatters';

interface MaskedInputProps extends Omit<InputProps, 'name'> {
  register?: UseFormRegisterReturn;
  error?: string;
  mask: 'cpf' | 'phone';
  onValueChange?: (unmaskedValue: string) => void;
  setValue?: (value: string) => void;
}

/**
 * Input component with automatic masking for CPF and phone numbers
 */
export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ register, error, mask, onValueChange, onChange, value: initialValue, defaultValue, setValue, ...props }, externalRef) => {
    const formatters = React.useMemo(() => ({
      cpf: { format: formatCPF, unformat: unformatCPF },
      phone: { format: formatPhone, unformat: unformatPhone },
    }), []);

    // Initialize display value with formatted initial value
    const [displayValue, setDisplayValue] = React.useState(() => {
      const valueToFormat = initialValue || defaultValue;
      if (valueToFormat && typeof valueToFormat === 'string') {
        return formatters[mask].format(formatters[mask].unformat(valueToFormat));
      }
      return '';
    });
    const hiddenInputRef = React.useRef<HTMLInputElement>(null);

    // Sync display value when defaultValue changes (from form reset)
    React.useEffect(() => {
      const valueToFormat = initialValue || defaultValue;
      if (valueToFormat && typeof valueToFormat === 'string') {
        const { format, unformat } = formatters[mask];
        const formatted = format(unformat(valueToFormat));
        setDisplayValue(formatted);
        // Also update hidden input
        if (hiddenInputRef.current) {
          hiddenInputRef.current.value = unformat(valueToFormat);
        }
      } else if (!valueToFormat) {
        // Clear display if value is empty
        setDisplayValue('');
        if (hiddenInputRef.current) {
          hiddenInputRef.current.value = '';
        }
      }
    }, [initialValue, defaultValue, mask, formatters]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      const { format, unformat } = formatters[mask];

      // Get unformatted value
      const unmasked = unformat(value);

      // Format the value for display
      const formatted = format(unmasked);

      console.log('MaskedInput handleChange:', {
        rawValue: value,
        unmasked,
        formatted
      });

      // Update display value
      setDisplayValue(formatted);

      // Update the form value using setValue if provided (preferred method)
      if (setValue) {
        console.log('Using setValue to update form:', unmasked);
        setValue(unmasked);
      } else if (hiddenInputRef.current) {
        // Fallback: Update hidden input value
        hiddenInputRef.current.value = unmasked;

        // Trigger onChange on hidden input
        if (register?.onChange) {
          const hiddenEvent = {
            ...e,
            target: hiddenInputRef.current,
            currentTarget: hiddenInputRef.current,
          };
          register.onChange(hiddenEvent as any);
        }
      }

      // Call onValueChange with unmasked value if provided
      if (onValueChange) {
        onValueChange(unmasked);
      }

      // Call original onChange if provided
      if (onChange) {
        onChange(e);
      }
    };

    // Use register's ref for hidden input
    const ref = register?.ref || externalRef;

    return (
      <>
        <Input
          {...props}
          value={displayValue}
          onChange={handleChange}
          error={error}
          aria-invalid={!!error}
        />
        {/* Hidden input for react-hook-form */}
        <input
          type="hidden"
          {...register}
          ref={ref}
        />
      </>
    );
  }
);

MaskedInput.displayName = 'MaskedInput';
