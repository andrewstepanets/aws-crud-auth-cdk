import { Button, Heading } from '@radix-ui/themes';
import { Link } from 'react-router';

interface NavProps {
    onSignOut: () => void;
}

export function Nav({ onSignOut }: NavProps) {
    return (
        <header className="nav">
            <Heading size="6">
                <Link to="/">Scenarios Service</Link>
            </Heading>
            <Button onClick={onSignOut} variant="soft">
                Sign out
            </Button>
        </header>
    );
}
