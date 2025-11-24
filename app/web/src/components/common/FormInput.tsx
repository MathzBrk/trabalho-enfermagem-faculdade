import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { Input, type InputProps } from '../ui/Input';

interface FormInputProps extends Omit<InputProps, 'name'> {
  register?: UseFormRegisterReturn;
  error?: string;
}

/**
 * Form input component that integrates with react-hook-form
 */
export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ register, error, ...props }, externalRef) => {
    // Use register's ref if available, otherwise use external ref
    const ref = register?.ref || externalRef;

    return (
      <Input
        {...props}
        {...register}
        ref={ref}
        error={error}
        aria-invalid={!!error}
      />
    );
  }
);

FormInput.displayName = 'FormInput';
