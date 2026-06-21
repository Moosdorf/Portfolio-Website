// Button.tsx
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const base = "p-2 rounded transition-colors";
  const variants = {
    primary: "bg-(--accent) text-white hover:opacity-90",
    secondary: "bg-(--code-bg) text-(--text-h) hover:bg-(--border)",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}