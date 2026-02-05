import { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Variant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = ({
  variant = "primary",
  children,
  ...props
}: PropsWithChildren<ButtonProps>) => (
  <button className={`btn btn-${variant}`} {...props}>
    {children}
  </button>
);
