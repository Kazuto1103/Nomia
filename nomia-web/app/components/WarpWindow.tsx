"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FrameNero, FrameUnderline, FrameLines, Animator } from "@arwes/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

interface WarpWindowProps {
    assetSrc: string;
    assetType: "video" | "image" | "gif";
    frameType: "neffos" | "underline" | "lines";
    speed?: number; // Parallax speed (e.g. 0.5, 1.5)
    initialX: string;
    initialY: string;
    width: string;
    height: string;
    label?: string;
}

export default function WarpWindow({
    assetSrc,
    assetType,
    frameType,
    speed = 1,
    initialX,
    initialY,
    width,
    height,
    label = "DATA_LINK",
}: WarpWindowProps) {
    const windowRef = useRef<HTMLDivElement>(null);
    const assetRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Intersection Observer to stop playback when off-screen
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
                if (videoRef.current) {
                    if (entry.isIntersecting) videoRef.current.play();
                    else videoRef.current.pause();
                }
            },
            { threshold: 0.1 }
        );

        if (windowRef.current) observer.observe(windowRef.current);

        // GSAP Parallax & Distortion
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: windowRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.5, // Smoother scrub
            }
        });

        tl.to(windowRef.current, {
            y: -150 * speed, // Slightly reduced for stability
            force3D: true,
            ease: "none",
        });

        // Velocity-based distortion (Simplified & Lightened)
        let proxy = { skew: 0 };
        let skewSetter = gsap.quickSetter(windowRef.current, "skewY", "deg");
        let clamp = gsap.utils.clamp(-5, 5); // Reduced intensity

        ScrollTrigger.create({
            onUpdate: (self) => {
                let skew = clamp(self.getVelocity() / -600); // Smoother calculation
                if (Math.abs(skew) > Math.abs(proxy.skew)) {
                    proxy.skew = skew;
                    gsap.to(proxy, {
                        skew: 0,
                        duration: 1.2,
                        ease: "power2.out",
                        overwrite: true,
                        onUpdate: () => skewSetter(proxy.skew)
                    });
                }
            }
        });

        return () => {
            observer.disconnect();
            ScrollTrigger.getAll().forEach(st => {
                if (st.trigger === windowRef.current) st.kill();
            });
        };
    }, [speed]);

    const renderFrame = () => {
        switch (frameType) {
            case "neffos":
                return <FrameNero className="absolute inset-0 text-white/20" />;
            case "underline":
                return <FrameUnderline className="absolute inset-0 text-white/20" />;
            case "lines":
                return <FrameLines className="absolute inset-0 text-white/20" />;
            default:
                return <FrameNero className="absolute inset-0 text-white/20" />;
        }
    };

    return (
        <div
            ref={windowRef}
            style={{
                position: "fixed",
                top: initialY,
                left: initialX,
                width,
                height,
                zIndex: 15,
                willChange: "transform", // Hardware acceleration
                backfaceVisibility: "hidden",
                transformStyle: "preserve-3d"
            }}
            className="pointer-events-none"
        >
            <Animator active={isVisible}>
                <div className="relative w-full h-full p-2 bg-black/40 backdrop-blur-sm group">
                    {renderFrame()}

                    {/* Label Bar */}
                    <div className="absolute -top-6 left-0 flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <div className="w-1 h-1 bg-white animate-pulse" />
                        <span className="text-[8px] tracking-[0.3em] font-bold uppercase">{label}</span>
                    </div>

                    {/* Asset Container */}
                    <div className="relative w-full h-full overflow-hidden border border-white/5">
                        {assetType === "video" ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover grayscale brightness-100 contrast-150"
                            >
                                <source src={assetSrc} type="video/mp4" />
                            </video>
                        ) : (
                            <img
                                src={assetSrc}
                                alt={label}
                                className={`w-full h-full object-cover grayscale brightness-75 contrast-125 transition-opacity duration-1000 ${isVisible ? "opacity-40" : "opacity-0"
                                    }`}
                            />
                        )}

                        {/* Scanline Overlay for each window */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_50%,transparent_50%)] bg-[length:100%_4px] pointer-events-none" />
                    </div>
                </div>
            </Animator>
        </div>
    );
}
