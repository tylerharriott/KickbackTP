import Link from 'next/link';

export default function Home() {
    return (
        <div>
            <h1>Welcome to the Home Page</h1>
            <p>
                <Link href="/LocationInput">
                    Go to the Location Input page
                </Link>
            </p>
        </div>
    );
}
