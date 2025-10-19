export function Input({ value, onChange, placeholder, type = "text", className = "", ...props }) {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`border rounded p-2 w-full ${className}`}
            {...props}
        />
    );
}