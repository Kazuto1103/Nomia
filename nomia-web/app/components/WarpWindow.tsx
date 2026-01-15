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
    isHighlighted?: boolean;
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
    isHighlighted = false,
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
        let st: ScrollTrigger | undefined;
        let pSt: ScrollTrigger | undefined;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: windowRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.5,
            }
        });
        // Capture the scrollTrigger instance from the timeline if accessible, or relying on the loop is actually standard if not stored.
        // Better pattern: ScrollTrigger.create returns an instance.
        // But here we attach to timeline. Timeline has .scrollTrigger property.
        st = tl.scrollTrigger;

        tl.to(windowRef.current, {
            y: -150 * speed,
            force3D: true,
            ease: "none",
        });

        // Velocity-based distortion
        let proxy = { skew: 0 };
        let skewSetter = gsap.quickSetter(windowRef.current, "skewY", "deg");
        let clamp = gsap.utils.clamp(-5, 5);

        pSt = ScrollTrigger.create({
            onUpdate: (self) => {
                let skew = clamp(self.getVelocity() / -600);
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
            if (st) st.kill();
            if (pSt) pSt.kill();
            tl.kill(); // Ensure timeline is killed
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
                <div className={`relative w-full h-full p-2 transition-[background-color,backdrop-filter] duration-500 group ${isHighlighted ? "bg-transparent backdrop-blur-none" : "bg-black/40 backdrop-blur-sm"
                    }`}>
                    {renderFrame()}

                    {/* Label Bar */}
                    <div className={`absolute -top-6 left-0 flex items-center gap-2 transition-opacity duration-300 ${isHighlighted ? "opacity-100" : "opacity-50 group-hover:opacity-100"
                        }`}>
                        <div className="w-1 h-1 bg-white animate-pulse" />
                        <span className="text-[8px] tracking-[0.3em] font-bold uppercase">{label}</span>
                    </div>

                    {/* Asset Container */}
                    <div className={`relative w-full h-full overflow-hidden border transition-colors duration-300 ${isHighlighted ? "border-white/20" : "border-white/5"
                        }`}>
                        {assetType === "video" ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className={`w-full h-full object-cover grayscale transition-[filter,opacity] duration-500 ${isHighlighted ? "brightness-125 contrast-125 opacity-100" : "brightness-100 contrast-150"
                                    }`}
                            >
                                <source src={assetSrc} type="video/mp4" />
                            </video>
                        ) : (
                            <img
                                src={assetSrc}
                                alt={label}
                                className={`w-full h-full object-cover grayscale transition-[filter,opacity] duration-1000 ${isHighlighted
                                    ? "brightness-100 contrast-125 opacity-100"
                                    : `brightness-75 contrast-125 ${isVisible ? "opacity-40" : "opacity-0"}`
                                    }`}
                            />
                        )}

                        {/* Scanline Overlay for each window - Disabled for highlighted */}
                        {!isHighlighted && (
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_50%,transparent_50%)] bg-[length:100%_4px] pointer-events-none" />
                        )}
                    </div>
                </div>
            </Animator>
        </div>
    );
}
