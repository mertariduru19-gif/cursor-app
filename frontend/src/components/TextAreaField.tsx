import { TextareaHTMLAttributes } from "react";

interface TextAreaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const TextAreaField = ({
  label,
  error,
  helperText,
  ...props
}: TextAreaFieldProps) => (
  <div className="form-field">
    <label>
      {label}
      <textarea className="textarea" {...props} />
    </label>
    {error ? <span className="error-text">{error}</span> : null}
    {!error && helperText ? (
      <span className="helper-text">{helperText}</span>
    ) : null}
  </div>
);
