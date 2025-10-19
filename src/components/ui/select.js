export function Select({ options, value, onChange, className = "" }) {
    return (
        <select
            value={value}
            onChange={onChange}
            className={`border rounded p-2 ${className}`}
        >
            {options.map((o) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
    );
}