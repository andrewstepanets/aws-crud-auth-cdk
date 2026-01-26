import { Link } from 'react-router';

interface NavProps {
    onSignOut: () => void;
}

export function Nav({ onSignOut }: NavProps) {
    return (
        <header className="nav">
            <h1>
                <Link to="/">Scenarios Service</Link>
            </h1>
            <button onClick={onSignOut}>Sign out</button>
        </header>
    );
}
