"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook for typewriter effect.
 * @param text The full text to type out.
 * @param speed Typing speed in milliseconds.
 * @param startDelay Delay before typing starts in milliseconds.
 * @param shouldStart Boolean to control when typing should begin.
 */
export function useTypewriter(
    text: string,
    speed: number = 30,
    startDelay: number = 0,
    shouldStart: boolean = true
) {
    const [displayText, setDisplayText] = useState("");
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!shouldStart) {
            setDisplayText("");
            setIsComplete(false);
            return;
        }

        setDisplayText("");
        setIsComplete(false);

        const timeout = setTimeout(() => {
            let i = 0;
            const interval = setInterval(() => {
                if (i < text.length) {
                    setDisplayText(text.slice(0, i + 1));
                    i++;
                } else {
                    setIsComplete(true);
                    clearInterval(interval);
                }
            }, speed);

            return () => clearInterval(interval);
        }, startDelay);

        return () => clearTimeout(timeout);
    }, [text, speed, startDelay, shouldStart]);

    return { displayText, isComplete };
}
