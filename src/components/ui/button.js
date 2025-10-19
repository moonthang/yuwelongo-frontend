export function Button({ children, onClick, type = "button", className = "", variant, size, disabled }) {
  const base =
    "px-3 py-2 rounded-md font-semibold transition-colors " +
    (variant === "destructive"
      ? "bg-red-600 text-white hover:bg-red-700"
      : "bg-blue-600 text-white hover:bg-blue-700");

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${className}`}
    >
      {children}
    </button>
  );
}