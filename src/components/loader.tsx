import { Box } from '@radix-ui/themes';
import { HTMLAttributes } from 'react';

export function Loader(props: HTMLAttributes<HTMLDivElement>) {
    return (
        <Box className="loader-container" {...props}>
            <Box className="loader" />
        </Box>
    );
}
