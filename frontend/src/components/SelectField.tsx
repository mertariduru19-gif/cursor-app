import { SelectHTMLAttributes } from "react";

interface Option {
  label: string;
  value: string;
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  error?: string;
  helperText?: string;
}

export const SelectField = ({
  label,
  options,
  error,
  helperText,
  ...props
}: SelectFieldProps) => (
  <div className="form-field">
    <label>
      {label}
      <select className="select" {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
    {error ? <span className="error-text">{error}</span> : null}
    {!error && helperText ? (
      <span className="helper-text">{helperText}</span>
    ) : null}
  </div>
);
