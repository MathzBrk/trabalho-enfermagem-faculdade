import React, { type ChangeEvent } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { Input, type InputProps } from '../ui/Input';
import { formatCPF, formatPhone, unformatCPF, unformatPhone } from '../../utils/formatters';

interface MaskedInputProps extends Omit<InputProps, 'name'> {
  register?: UseFormRegisterReturn;
  error?: string;
  mask: 'cpf' | 'phone';
  onValueChange?: (unmaskedValue: string) => void;
}

/**
 * Input component with automatic masking for CPF and phone numbers
 */
export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ register, error, mask, onValueChange, onChange, ...props }, ref) => {
    const formatters = {
      cpf: { format: formatCPF, unformat: unformatCPF },
      phone: { format: formatPhone, unformat: unformatPhone },
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      const { format, unformat } = formatters[mask];

      // Get unformatted value
      const unmasked = unformat(value);

      // Format the value
      const formatted = format(unmasked);

      // Update the input value
      e.target.value = formatted;

      // Call onValueChange with unmasked value if provided
      if (onValueChange) {
        onValueChange(unmasked);
      }

      // Call original onChange if provided
      if (onChange) {
        onChange(e);
      }

      // Call react-hook-form's onChange if register is provided
      if (register?.onChange) {
        // Update with unformatted value for form validation
        const unmaskedEvent = {
          ...e,
          target: { ...e.target, value: unmasked },
        };
        register.onChange(unmaskedEvent);
      }
    };

    return (
      <Input
        {...props}
        {...(register ? { ...register, onChange: handleChange } : { onChange: handleChange })}
        ref={ref}
        error={error}
        aria-invalid={!!error}
      />
    );
  }
);

MaskedInput.displayName = 'MaskedInput';
