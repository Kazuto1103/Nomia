"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function AtmosphereController() {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const blurLayerRef = useRef<HTMLDivElement>(null);
    const gridLayerRef = useRef<HTMLDivElement>(null);
    const noiseRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Helper to find layer elements
            const getLayer = (id: string) => document.querySelector(`section[data-layer="${id}"]`);

            const layer1 = getLayer("1");
            const layer2 = getLayer("2");
            const layer3 = getLayer("3");
            const layer4 = getLayer("4");

            // DEFAULT / LAYER 1: THE SURFACE
            // Baseline state: Grayscale 100%, Brightness 1.0, Contrast 1.0, Scale 1.0

            // LAYER 2: THE HANGAR (Depth Focus)
            if (layer2) {
                // Focus Effect: Blur foreground + Dim background + Slight Zoom
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: layer2,
                        start: "top 80%",
                        end: "top 20%",
                        scrub: true,
                    }
                });

                tl.to(blurLayerRef.current, {
                    backdropFilter: "blur(12px)", // Deeper blur
                    ease: "none",
                }, 0)
                    .to(videoRef.current, {
                        scale: 1.05, // Slight "focus" zoom
                        filter: "grayscale(100%) brightness(0.6) contrast(1.1)", // Dim to make foreground pop
                        ease: "none"
                    }, 0);
            }

            // LAYER 3: THE BLUEPRINT (Technical Analysis)
            if (layer3) {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: layer3,
                        start: "top 80%",
                        end: "top 20%",
                        scrub: true,
                    }
                });

                // Clear Blur, Shift to Technical Contrast
                tl.to(blurLayerRef.current, {
                    backdropFilter: "blur(0px)",
                    ease: "none",
                }, 0)
                    .to(videoRef.current, {
                        scale: 1.0, // Reset zoom
                        filter: "grayscale(100%) brightness(0.8) contrast(1.3)", // High contrast technical look
                        ease: "none"
                    }, 0)
                    .to(gridLayerRef.current, {
                        opacity: 0.6, // Pulse grid in
                        ease: "power2.inOut"
                    }, 0);
            }

            // LAYER 4 & 5: THE GLITCH (System Instability)
            if (layer4) {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: layer4,
                        start: "top bottom", // Start as soon as it enters view
                        end: "top top",      // Fully transitioned by top
                        scrub: true,
                    }
                });

                // Deep Zoom (Sucked in) + Harsh Glitchy Lighting + Grain
                tl.to(videoRef.current, {
                    scale: 1.25, // Deep immersive zoom
                    filter: "grayscale(100%) brightness(1.2) contrast(1.5)", // Blown out highlights, crushed blacks
                    ease: "power1.in", // Accelerate into it
                }, 0)
                    .to(noiseRef.current, {
                        opacity: 0.25, // Heavy grain
                        ease: "none"
                    }, 0)
                    .to(gridLayerRef.current, {
                        opacity: 0, // Hide grid
                        ease: "none"
                    }, 0);
            }

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {/* GLOBAL VIDEO BACKGROUND */}
            <div className="absolute inset-0 z-0">
                <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover grayscale opacity-80 will-change-transform"
                    style={{ filter: 'grayscale(100%) brightness(1) contrast(1)' }}
                >
                    <source src="/decoration/bg_decoration.mp4" type="video/mp4" />
                </video>
            </div>

            {/* SCANLINES (Consistent Texture) */}
            <div className="scanlines absolute inset-0 z-10 opacity-30" />

            {/* DYNAMIC BLUR LAYER (For Focus Shifts) */}
            <div
                ref={blurLayerRef}
                className="absolute inset-0 z-20 will-change-[backdrop-filter]"
                style={{ backdropFilter: "blur(0px)" }}
            />

            {/* GRID OVERLAY (Animated Technical Layer) */}
            <div
                ref={gridLayerRef}
                className="absolute inset-0 z-30 opacity-0 will-change-opacity animate-pan-grid"
                style={{
                    backgroundImage: `
            radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
                    backgroundSize: '40px 40px, 80px 80px, 80px 80px'
                }}
            />

            {/* NOISE OVERLAY (Dynamic Grit) */}
            <div
                ref={noiseRef}
                className="noise-overlay absolute inset-0 z-40 will-change-opacity"
                style={{ opacity: 0.05 }}
            />

            {/* VIGNETTE (Cinematic Frame) */}
            <div className="vignette absolute inset-0 z-50" />
        </div>
    );
}
