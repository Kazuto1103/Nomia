"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
    const { scrollYProgress } = useScroll();

    // Smooth out the progress bar movement
    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <>
            {/* Right Bar */}
            <motion.div
                className="fixed top-0 right-0 w-[2px] h-full bg-white z-[9999] origin-top mix-blend-difference"
                style={{ scaleY }}
            />
            {/* Left Bar */}
            <motion.div
                className="fixed top-0 left-0 w-[2px] h-full bg-white z-[9999] origin-top mix-blend-difference"
                style={{ scaleY }}
            />
        </>
    );
}
