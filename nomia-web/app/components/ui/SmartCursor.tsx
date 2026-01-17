'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useCursor } from '@/app/context/CursorContext';
import { useScrambleText } from '@/app/hooks/useScrambleText';

// Sub-component to trigger scramble hook on text change
const CursorLabel = ({ text }: { text: string }) => {
    const scrambled = useScrambleText(text, 500);
    return <>{scrambled}</>;
};

export default function SmartCursor() {
    // Refs for GSAP & State Tracking
    const cursorRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<string>("");

    const { cursorText, setCursorText } = useCursor();

    // Sync Ref with State
    useEffect(() => {
        textRef.current = cursorText;
    }, [cursorText]);

    // Position State
    const [isRightSide, setIsRightSide] = useState(false);

    // Physics Refs
    const xToDot = useRef<any>(null);
    const yToDot = useRef<any>(null);
    const xToRing = useRef<any>(null);
    const yToRing = useRef<any>(null);

    // MAIN EFFECT: RUNS ONCE
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.set(cursorRef.current, { xPercent: 0, yPercent: 0 });
            gsap.set(ringRef.current, { xPercent: 0, yPercent: 0 });

            xToDot.current = gsap.quickTo(cursorRef.current, "x", { duration: 0.1, ease: "power2.out" });
            yToDot.current = gsap.quickTo(cursorRef.current, "y", { duration: 0.1, ease: "power2.out" });

            xToRing.current = gsap.quickTo(ringRef.current, "x", { duration: 0.35, ease: "back.out(1.5)" });
            yToRing.current = gsap.quickTo(ringRef.current, "y", { duration: 0.35, ease: "back.out(1.5)" });
        });

        const moveMouse = (e: MouseEvent) => {
            if (xToDot.current && yToDot.current) {
                xToDot.current(e.clientX);
                yToDot.current(e.clientY);
            }
            if (xToRing.current && yToRing.current) {
                xToRing.current(e.clientX);
                yToRing.current(e.clientY);
            }

            // Adaptive Side Logic
            const onRight = e.clientX > window.innerWidth / 2;
            setIsRightSide(prev => {
                if (prev !== onRight) return onRight;
                return prev;
            });
        };

        const checkHover = (e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest('[data-cursor]');
            if (target) {
                const newText = target.getAttribute('data-cursor') || "";
                if (newText !== textRef.current) {
                    setCursorText(newText);
                }
            } else {
                if (textRef.current !== "") {
                    setCursorText("");
                }
            }
        };

        window.addEventListener("mousemove", moveMouse);
        window.addEventListener("mouseover", checkHover);

        return () => {
            window.removeEventListener("mousemove", moveMouse);
            window.removeEventListener("mouseover", checkHover);
            ctx.revert();
        };
    }, [setCursorText]);

    return (
        <>
            {/* OUTER RING */}
            <div
                ref={ringRef}
                className="fixed top-0 left-0 z-[10001] pointer-events-none mix-blend-difference will-change-transform"
            >
                <div className="w-8 h-8 border border-white rounded-full absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 opacity-50" />
            </div>

            {/* INNER DOT & INFO */}
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 z-[10001] pointer-events-none mix-blend-difference will-change-transform"
            >
                {/* DOT */}
                <div className="w-2 h-2 bg-white rounded-full absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2" />

                {/* INFO CONTAINER */}
                <div className={`transition-opacity duration-300 ${cursorText ? 'opacity-100' : 'opacity-0'}`}>

                    {/* SVG CONNECTOR */}
                    <svg
                        width="40" height="20"
                        className="absolute top-0 left-0 overflow-visible pointer-events-none"
                        style={{
                            transform: isRightSide ? 'scaleX(-1)' : 'none',
                            transformOrigin: '0px 0px'
                        }}
                    >
                        <path
                            d="M 0 0 L 12 -12 L 40 -12"
                            fill="none"
                            stroke="white"
                            strokeWidth="0.5"
                            className="opacity-60"
                        />
                        {/* Tiny decorative rect at end of line */}
                        <rect x="38" y="-13" width="2" height="2" fill="white" className="opacity-80" />
                    </svg>

                    {/* TEXT LABEL - ABSOLUTE POSITIONED */}
                    <div
                        className={`absolute top-[-24px] whitespace-nowrap flex items-center gap-1 ${isRightSide ? 'right-[45px] flex-row-reverse' : 'left-[45px] flex-row'}`}
                    >
                        {/* DECORATIVE HEX PREFIX */}
                        <span className="font-mono text-[7px] text-white/40 tracking-wider">0x_</span>

                        {/* MAIN TEXT BLOCK with BRACKETS */}
                        <span className="font-mono text-[9px] font-bold tracking-[0.1em] text-white flex items-center gap-[2px]">
                            <span className="text-white/40 opacity-50">[</span>
                            <span className="text-white">
                                {cursorText && <CursorLabel text={cursorText} />}
                            </span>
                            <span className="text-white/40 opacity-50">]</span>
                        </span>

                        {/* BLINKING TERMINAL CURSOR */}
                        <span className="w-1.5 h-3 bg-white animate-pulse ml-1" />
                    </div>

                </div>
            </div>
        </>
    );
}
