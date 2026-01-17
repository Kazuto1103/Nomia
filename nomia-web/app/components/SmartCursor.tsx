"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useCursor } from "../context/CursorContext";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_!@#$%^&*";

export default function SmartCursor() {
    const { cursorText, setCursorText } = useCursor();
    const [displayText, setDisplayText] = useState("");

    // SINGLE REF - The only thing that moves via GSAP
    const cursorRef = useRef<HTMLDivElement>(null);

    // Content Ref for Flipping
    const contentRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    const [hasMoved, setHasMoved] = useState(false);

    // SCRAMBLE LOGIC
    useEffect(() => {
        let interval: NodeJS.Timeout;
        let counter = 0;

        if (cursorText) {
            interval = setInterval(() => {
                const scrambled = cursorText
                    .split("")
                    .map((char, index) => {
                        if (index < counter) return cursorText[index];
                        return CHARS[Math.floor(Math.random() * CHARS.length)];
                    })
                    .join("");
                setDisplayText(scrambled);
                counter += 1 / 2;
                if (counter >= cursorText.length) {
                    clearInterval(interval);
                    setDisplayText(cursorText);
                }
            }, 30);
        } else {
            setDisplayText("");
        }
        return () => clearInterval(interval);
    }, [cursorText]);

    // ZERO-LATENCY MOVEMENT
    useEffect(() => {
        if (!cursorRef.current) return;

        // ONLY PARENT MOVES
        const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.1, ease: "power3.out" });
        const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.1, ease: "power3.out" });

        const handleMouseMove = (e: MouseEvent) => {
            if (!hasMoved) {
                setHasMoved(true);
                gsap.set(cursorRef.current, { x: e.clientX, y: e.clientY });
            }

            // Move Parent
            xTo(e.clientX);
            yTo(e.clientY);

            // Flip Logic (Visual Only)
            if (contentRef.current && textRef.current) {
                const isRightSide = e.clientX > window.innerWidth * 0.6;
                // Normalize scales
                const contentScale = isRightSide ? -1 : 1;
                const textScale = isRightSide ? -1 : 1;

                // Flip Container
                gsap.to(contentRef.current, { scaleX: contentScale, duration: 0.2, overwrite: true });
                // Counter-Flip Text so it reads correctly
                gsap.to(textRef.current, { scaleX: textScale, duration: 0.2, overwrite: true });
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        document.body.style.cursor = "none";

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            document.body.style.cursor = "auto";
        };
    }, [hasMoved]);

    // GLOBAL HOVER (Context Update)
    useEffect(() => {
        const handleHover = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const cursorTarget = target.closest('[data-cursor]');
            const interactiveTarget = target.closest('a, button, input, textarea, [role="button"], .clickable');

            if (cursorTarget) {
                setCursorText(cursorTarget.getAttribute('data-cursor') || "");
            } else if (interactiveTarget) {
                // Keep text empty for generic interactive
                setCursorText("");
            } else {
                setCursorText("");
            }
        };
        window.addEventListener("mouseover", handleHover);
        return () => window.removeEventListener("mouseover", handleHover);
    }, [setCursorText]);

    return (
        <div
            ref={cursorRef}
            className={`fixed top-0 left-0 z-[10001] pointer-events-none mix-blend-difference will-change-transform ${hasMoved ? 'opacity-100' : 'opacity-0'}`}
        >
            {/* 1. VISUAL WRAPPER (Dot + Ring) */}
            <div className="relative flex items-center justify-center">

                {/* Main Dot (Center) - Solid White */}
                <div className={`
                    absolute bg-white rounded-full transition-all duration-300
                    ${cursorText ? "w-3 h-3" : "w-1.5 h-1.5"}
                `} />

                {/* Outer Ring (Thin) - Always Centered, Scale on Active */}
                <div className={`
                    absolute rounded-full border border-white transition-all duration-300 ease-out box-border
                    ${cursorText ? "w-[50px] h-[50px] opacity-100 border-[1px]" : "w-[40px] h-[40px] opacity-40 border-[0.5px]"}
                `} />

            </div>

            {/* 2. SMART FOLLOWER (Line + Text) - Relative to Center */}
            {/* We offset this container 10px to right to start AFTER the dot? No, line must touch dot. */}
            <div
                ref={contentRef}
                className={`absolute top-0 left-0 transition-opacity duration-300 ${cursorText ? 'opacity-100' : 'opacity-0'}`}
            >
                {/* Connector Line 
                    Start point (x=0) is the center of the cursor.
                    Dot radius is ~4px. 
                    Path should start at x=6 to allow small breathing room or x=5 to touch.
                */}
                <svg
                    width="80" height="20"
                    className="absolute top-0 left-0 overflow-visible"
                    style={{ transform: 'translate(0, -50%)' }} // Center vertically
                >
                    {/* Path: 
                        M 6 0  (Start at edge of dot)
                        L 25 0 (Go right)
                        L 30 5 (Angle down)
                        L 60 5 (End)
                    */}
                    <path
                        d="M 6 0 L 25 0 L 30 5 L 60 5"
                        fill="none"
                        stroke="white"
                        strokeWidth="1"
                    />
                </svg>

                {/* Command Text */}
                <div
                    ref={textRef}
                    className="absolute left-[65px] top-[0px] font-mono text-[10px] text-white tracking-widest whitespace-nowrap -translate-y-1/2"
                >
                    <span className="font-bold mr-1 opacity-50">CMD:</span>
                    {displayText}
                </div>
            </div>
        </div>
    );
}
