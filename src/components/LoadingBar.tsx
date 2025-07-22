import React, { useEffect, useState } from 'react';

const TOTAL_BLOCKS = 10;
const DURATION = 3000;

const LoadingBar = () => {
    const [filled, setFilled] = useState(0);

    useEffect(() => {
        const interval = DURATION / TOTAL_BLOCKS;
        let count = 0;

        const timer = setInterval(() => {
            count++;
            setFilled(count);
            if (count >= TOTAL_BLOCKS) clearInterval(timer);
        }, interval);

        return () => clearInterval(timer);
    }, []);

    const blocks = Array.from({ length: TOTAL_BLOCKS }, (_, i) =>
        i < filled ? '▮' : '▯'
    );

    return (
        <div
            style={{
                fontSize: '48px',
                fontFamily: 'monospace',
                textAlign: 'center',
                color: 'black',
            }}
        >
            {blocks.join(' ')}
        </div>
    );
};

export default LoadingBar;
