import { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const TextField = ({
  label,
  error,
  helperText,
  ...props
}: TextFieldProps) => (
  <div className="form-field">
    <label>
      {label}
      <input className="input" {...props} />
    </label>
    {error ? <span className="error-text">{error}</span> : null}
    {!error && helperText ? (
      <span className="helper-text">{helperText}</span>
    ) : null}
  </div>
);
