import { HTMLAttributes } from 'react';

export function Loader(props: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className="loader-container" {...props}>
            <div className="loader" />
        </div>
    );
}
