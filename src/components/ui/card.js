export function Card({ children, className = "" }) {
    return <div className={`border rounded-lg shadow p-4 bg-white ${className}`}>{children}</div>;
}

export function CardHeader({ children }) {
    return <div className="border-b pb-2 mb-2 font-bold text-lg">{children}</div>;
}

export function CardContent({ children }) {
    return <div>{children}</div>;
}