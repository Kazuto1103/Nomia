"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const cursor = cursorRef.current;
        const inner = innerRef.current;
        if (!cursor || !inner) return;

        // Hide default cursor
        document.body.style.cursor = "none";

        const xTo = gsap.quickTo(cursor, "x", { duration: 0.4, ease: "power3" });
        const yTo = gsap.quickTo(cursor, "y", { duration: 0.4, ease: "power3" });

        const xInnerTo = gsap.quickTo(inner, "x", { duration: 0.1, ease: "none" });
        const yInnerTo = gsap.quickTo(inner, "y", { duration: 0.1, ease: "none" });

        const handleMouseMove = (e: MouseEvent) => {
            xTo(e.clientX);
            yTo(e.clientY);
            xInnerTo(e.clientX);
            yInnerTo(e.clientY);
        };

        const handleMouseDown = () => {
            gsap.to(cursor, { scale: 0.8, duration: 0.2 });
            gsap.to(inner, { scale: 2, duration: 0.2 });
        };

        const handleMouseUp = () => {
            gsap.to(cursor, { scale: 1, duration: 0.2 });
            gsap.to(inner, { scale: 1, duration: 0.2 });
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "auto";
        };
    }, []);

    return (
        <>
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-12 h-12 border border-white/30 rounded-full pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center mix-blend-difference"
            >
                <div className="w-[1px] h-full bg-white/10 absolute rotate-45" />
                <div className="w-[1px] h-full bg-white/10 absolute -rotate-45" />
            </div>
            <div
                ref={innerRef}
                className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[100000] -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
            />
        </>
    );
}
