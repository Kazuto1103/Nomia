"use client";

// NOMIA V2.0 MASTER LANDING PAGE
// Immersive Scroll | Parallax | Phantom Aesthetic

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Cpu, ArrowRight, Activity, Terminal, ShieldAlert, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MechaTechSpecs from "./components/MechaTechSpecs";
import ScrollDecoration from "./components/ScrollDecoration";
import ModeSelector from "./components/ModeSelector";
import dynamic from "next/dynamic";

const FloatingWarpSystem = dynamic(() => import("./components/FloatingWarpSystem"), { ssr: false });
import Lenis from "lenis";

// Register GSAP Plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function NomiaLanding() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showTechSpecs, setShowTechSpecs] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // SECTION 1: IDENTITY (HERO)
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // SECTION 2: FLEET (REGISTRY)
  const fleetRef = useRef<HTMLDivElement>(null);

  // SECTION 3: GATEWAY (PORTAL)
  const gatewayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Parallax Effects
    const ctx = gsap.context(() => {
      // Hero Parallax
      gsap.to(titleRef.current, {
        y: -100,
        opacity: 0,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        }
      });

      // Fleet Reveal
      gsap.from(".fleet-card", {
        y: 100,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: fleetRef.current,
          start: "top 70%",
        }
      });

      // Biography Reveal (Line by line)
      gsap.utils.toArray(".bio-line").forEach((line: any) => {
        gsap.from(line, {
          y: 20,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: line,
            start: "top 80%",
            end: "top 50%",
            scrub: 1,
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    // Lenis Smooth Scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // GSAP ScrollTrigger Refresh
    ScrollTrigger.refresh();

    return () => {
      lenis.destroy();
    };
  }, []);

  const navigateToTerminal = () => {
    setIsNavigating(true);
    setTimeout(() => {
      setShowModeSelector(true);
      setIsNavigating(false);
    }, 500);
  };

  return (
    <main ref={containerRef} className="relative min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black overflow-x-hidden">

      {/* 1. GLOBAL BACKGROUND (Low Opacity) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 overflow-hidden">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover grayscale">
          <source src="/decoration/bg_decoration.mp4" type="video/mp4" />
        </video>
      </div>

      {/* 2. HUD OVERLAYS (4 Quadrants) */}
      <div className="fixed inset-0 z-10 pointer-events-none mix-blend-screen overflow-hidden">
        {/* Top Left */}
        <div className="absolute top-0 left-0 w-1/3 h-1/3 opacity-40">
          <video autoPlay loop muted playsInline className="w-full h-full object-contain object-left-top">
            <source src="/decoration/hologram_overlay.mp4" type="video/mp4" />
          </video>
        </div>
        {/* Top Right */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 opacity-30">
          <video autoPlay loop muted playsInline className="w-full h-full object-contain object-right-top">
            <source src="/decoration/hologram_overlay2.mp4" type="video/mp4" />
          </video>
        </div>
        {/* Bottom Left */}
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 opacity-30">
          <video autoPlay loop muted playsInline className="w-full h-full object-contain object-left-bottom">
            <source src="/decoration/hologram_overlay3.mp4" type="video/mp4" />
          </video>
        </div>
        {/* Bottom Right */}
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 opacity-40">
          <video autoPlay loop muted playsInline className="w-full h-full object-contain object-right-bottom">
            <source src="/decoration/hologram_overlay4.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      {/* 3. FLOATING WARP SYSTEM */}
      <FloatingWarpSystem />

      {/* 4. ATMOSPHERIC LAYERS */}
      <div className="scanlines" />
      <div className="vignette" />

      {/* Visual Noise Transition */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-white pointer-events-none"
          >
            <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/oEI9uWU0WMrQmURwEc/giphy.gif')] opacity-50 mix-blend-difference bg-repeat" />
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 01: IDENTITY (HERO) */}
      <section ref={heroRef} className="relative z-20 h-screen flex flex-col items-center justify-center p-6 bg-black/20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "circOut" }}
          className="flex flex-col items-center"
        >
          <div className="mb-4 flex items-center gap-4 opacity-50">
            <span className="h-[1px] w-12 bg-white"></span>
            <span className="text-[10px] tracking-[0.5em] uppercase">NOMIA // SYSTEM_PORTAL</span>
            <span className="h-[1px] w-12 bg-white"></span>
          </div>

          <h1 ref={titleRef} className="text-[12vw] font-black leading-none tracking-tighter mix-blend-difference relative glow-text">
            <span className="block relative z-20 text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500">NOMIA</span>
            <span className="absolute inset-0 z-10 text-white/5 blur-sm">NOMIA</span>
          </h1>

          <div className="mt-12 max-w-2xl text-center space-y-6">
            <p className="bio-line text-lg md:text-2xl font-bold tracking-tight opacity-100 glow-text">
              Dystopian. Industrial. Automated.
            </p>
            <div className="flex flex-col gap-4">
              <p className="bio-line text-sm opacity-60 leading-relaxed uppercase tracking-widest">
                Merging synthetic consciousness with raw steel protocols.
              </p>
              <p className="bio-line text-sm opacity-60 leading-relaxed uppercase tracking-widest">
                System optimized for high-fidelity interactive engagement.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 02: FLEET REGISTRY */}
      <section ref={fleetRef} className="relative z-20 py-32 px-6 md:px-20 border-b border-white/10 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 flex justify-between items-end border-b border-white/20 pb-6">
            <h2 className="text-6xl font-black tracking-tighter">FLEET_REGISTRY</h2>
            <div className="text-right">
              <p className="text-[10px] tracking-widest opacity-50">ACTIVE_UNITS</p>
              <p className="text-4xl font-mono">01</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* CARD: V1-RG */}
            <div className="fleet-card group relative min-h-[400px] border border-white/20 hover:border-white transition-all duration-500 bg-black/40 backdrop-blur-md overflow-hidden">
              {/* Hover Overlay - Invert Logic */}
              <div className="absolute inset-0 bg-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0"></div>

              <div className="relative z-10 p-8 h-full flex flex-col justify-between group-hover:text-black transition-colors duration-300">
                <div className="flex justify-between items-start">
                  <Cpu className="w-12 h-12 opacity-50 group-hover:opacity-100" />
                  <span className="border border-current px-3 py-1 text-[9px] tracking-widest">[ PHANTOM_CLASS ]</span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-5xl font-black tracking-tighter">V1-RG</h3>
                  <p className="text-sm opacity-70 max-w-xs leading-relaxed font-sans">
                    Autonomous exploration unit equipped with ultrasonic proximity sensors and real-time telemetry uplink.
                  </p>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex gap-4 text-[10px] tracking-widest opacity-60 border-b border-current/20 pb-4">
                    <span>UDP_LINK: OK</span>
                    <span>BATTERY: 98%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTechSpecs(true);
                      }}
                      className="relative z-20 flex items-center gap-2 text-xs border border-current px-4 py-2 hover:bg-current hover:text-white group-hover:bg-black group-hover:text-white transition-colors"
                    >
                      <Info className="w-3 h-3" />
                      <span className="tracking-widest">TECH_SPECS</span>
                    </button>
                    <ArrowRight className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* CARD: VOID-X (Placeholder) */}
            <div className="fleet-card opacity-40 grayscale border border-dashed border-white/20 min-h-[400px] flex items-center justify-center bg-[url('/assets/grid.png')]">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-2xl font-bold tracking-widest">ZN-02 [LOCKED]</h3>
                <p className="text-[10px] uppercase mt-2">Awaiting Schematics</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 03: V1-RG PORTAL (GATEWAY) */}
      <section ref={gatewayRef} className="relative z-20 h-screen flex flex-col items-center justify-center bg-white text-black p-8">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover filter invert">
            <source src="/decoration/hologram_overlay.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="max-w-2xl text-center space-y-12 relative z-20">
          <div className="space-y-4">
            <ShieldAlert className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-6xl font-black tracking-tighter">RESTRICTED_ACCESS</h2>
            <p className="text-sm font-mono opacity-60 tracking-widest">
              AUTHORIZATION REQUIRED FOR DIRECT HARDWARE CONTROL
            </p>
          </div>

          <div className="flex flex-col gap-4 max-w-xs mx-auto w-full">
            <button
              onClick={navigateToTerminal}
              className="group border-2 border-black py-4 px-8 hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-between"
            >
              <span className="font-bold tracking-widest text-xs">ACCESS_TERMINAL</span>
              <Terminal className="w-4 h-4" />
            </button>
            <Link href="/dashboard" className="text-xs tracking-widest opacity-40 hover:opacity-100 text-center uppercase">
              [ Return to Dashboard ]
            </Link>
          </div>
        </div>
      </section>

      {/* Fixed HUD (Scroll-triggered) */}
      <div className="fixed top-8 right-8 z-[60] flex flex-col items-end pointer-events-none mix-blend-difference">
        <div className="text-[10px] font-bold tracking-widest mb-1">SCROLL_DEPTH</div>
        <motion.div
          style={{
            scaleY: useTransform(useScroll().scrollYProgress, [0, 1], [0, 1])
          }}
          className="h-24 w-[2px] bg-white origin-top"
        ></motion.div>
      </div>

      {/* Mecha Tech Specs Popup */}
      <MechaTechSpecs isOpen={showTechSpecs} onClose={() => setShowTechSpecs(false)} />

      {/* Scroll-Synced Decorations */}
      <ScrollDecoration />

      {/* Mode Selector Popup */}
      <ModeSelector isOpen={showModeSelector} onClose={() => setShowModeSelector(false)} />

    </main>
  );
}
