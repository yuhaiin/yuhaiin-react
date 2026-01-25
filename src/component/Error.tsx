
interface ErrorProps {
    statusCode: number;
    title?: string;
    description?: string;
}

export default function Error({ statusCode, title, description }: ErrorProps) {
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>{statusCode}</h1>
            <p>{title}</p>
            <p>{description}</p>
        </div>
    );
}
