import { useState, useEffect, useRef } from 'react';

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_!@#$%^&*";

export function useScrambleText(targetText: string, duration: number = 500) {
    const [displayText, setDisplayText] = useState(targetText);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        let startTime = Date.now();

        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            const now = Date.now();
            const progress = Math.min(1, (now - startTime) / duration);

            if (progress >= 1) {
                setDisplayText(targetText);
                if (intervalRef.current) clearInterval(intervalRef.current);
                return;
            }

            // Scramble Logic
            const scrambled = targetText
                .split('')
                .map((char, index) => {
                    // Lock characters as progress increases
                    if (index < targetText.length * progress) {
                        return targetText[index];
                    }
                    return CHARS[Math.floor(Math.random() * CHARS.length)];
                })
                .join('');

            setDisplayText(scrambled);
        }, 30); // ~30fps scramble update

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [targetText, duration]);

    return displayText;
}
