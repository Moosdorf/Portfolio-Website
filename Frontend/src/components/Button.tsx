// Button.tsx
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const base = "p-2 rounded transition-colors";
  const variants = {
    primary: "bg-(--accent) text-white hover:opacity-90 cursor-pointer",
    secondary:
      "bg-(--code-bg) text-(--text-h) border border-white hover:bg-(--border) cursor-pointer",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}