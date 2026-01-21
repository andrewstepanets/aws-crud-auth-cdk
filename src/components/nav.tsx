interface NavProps {
    onSignOut: () => void;
}

export function Nav({ onSignOut }: NavProps) {
    return (
        <header className="nav">
            <h1>Scenarios Service</h1>
            <button onClick={onSignOut}>Sign out</button>
        </header>
    );
}
