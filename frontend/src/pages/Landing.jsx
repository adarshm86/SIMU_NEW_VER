import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroVideo from "../public/herosection1.mp4";
import GlassCard from "../components/GlassCard.jsx";

const EVOLUTION_STAGES = [
  "Initial Colony",
  "Reproduction",
  "Mutation",
  "Selection",
  "Resistance",
  "Dominant Resistant Colony",
];

const FEATURES = [
  { title: "3D Petri Dish", desc: "Real-time WebGL visualization of a living bacterial colony under antibiotic stress." },
  { title: "Genetic Algorithm", desc: "Reproduction, mutation, and selection modeled generation by generation." },
  { title: "ML Prediction", desc: "Forecasts resistance trajectories and dominant-generation estimates." },
  { title: "Antibiotic Heatmaps", desc: "Diffusion-based concentration fields rendered directly onto the dish." },
  { title: "Interactive Dashboard", desc: "Tune every parameter and watch the colony respond live." },
  { title: "Experiment History", desc: "A running research log of every mutation and resistance event." },
  { title: "Research Reports", desc: "Export full experiment data as JSON or CSV for further analysis." },
];

const LAB_IMAGES = [
  "https://images.unsplash.com/photo-1583912267550-d6c2ac3196c0?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop",
];

function useAutoCarousel(length, interval = 3500) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % length), interval);
    return () => clearInterval(id);
  }, [length, interval]);
  return index;
}

function useAutoStage(length, interval = 1400) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStage((s) => (s + 1) % length), interval);
    return () => clearInterval(id);
  }, [length, interval]);
  return stage;
}

export default function Landing() {
  const carouselIndex = useAutoCarousel(LAB_IMAGES.length);
  const activeStage = useAutoStage(EVOLUTION_STAGES.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{ fontFamily: "'Pally', sans-serif" }}
      className="bg-[#0c0d0c] min-h-screen text-white"
    >
      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        >
            <source src={heroVideo} type="video/mp4" />
        </video>

        <div className="relative z-10 text-center px-6 max-w-5xl flex flex-col items-center">
          {/* Slogan */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8 inline-block px-6 py-2 rounded-full border border-earth-300/30 bg-earth-300/5 "
          >
            <p className="text-earth-300 font-bold tracking-[0.25em] uppercase text-xs sm:text-sm">
              Decoding Resistance. One Generation at a Time.
            </p>
          </motion.div>
          
          {/* BOLD HERO TITLE */}
          <motion.h1
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.35, duration: 0.8, ease: "easeOut" }}
            className="font-black text-3xl sm:text-3xl md:text-7xl leading-[1.9] tracking-wide text-white uppercase"
          >
            Microbial Evolution
            <br />
            <span className="text-[#FF0000]">
              Under Antibiotic Stress
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-8 text-white/70 text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed"
          >
            A computational platform for simulating bacterial reproduction,
            mutation, and selection pressure modeling how antibiotic
            resistance emerges and spreads across a living colony.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-12 flex flex-wrap justify-center gap-5"
          >
            <Link 
              to="/how-to-use" 
              className="px-8 py-3.5 rounded-full border-2 border-earth-300/60 text-earth-300 font-bold uppercase tracking-widest hover:bg-earth-300/10 hover:border-earth-300 transition-all duration-300"
            >
              Explore Project
            </Link>
            <Link 
              to="/dashboard" 
              className="px-8 py-3.5 rounded-full bg-[#fecf33] text-[#0c0d0c] font-bold uppercase tracking-widest hover:bg-emerald-400 hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-emerald-300/20"
            >
              Launch Laboratory
            </Link>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-7 h-12 rounded-full border-2 border-earth-300/30 flex justify-center pt-2">
            <span className="w-1.5 h-3 bg-earth-300 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* SECTION 2: Explanation + Carousel */}
      <section className="max-w-6xl mx-auto px-6 py-28 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <div className="pr-4">
          <p className="text-earth-300 font-bold tracking-widest uppercase text-sm mb-4">The Problem</p>
          <h2 className="font-bold text-4xl md:text-5xl text-white mb-8 leading-tight">
            Why Antibiotic Resistance Matters
          </h2>
          <p className="text-white/70 leading-relaxed mb-5 font-medium text-lg">
            Antibiotic resistance is one of the most pressing challenges in
            modern medicine. As bacterial populations reproduce under
            selective pressure, random mutations that confer survival
            advantages spread rapidly — sometimes within a matter of days.
          </p>
          <p className="text-white/70 leading-relaxed mb-5 font-medium text-lg">
            Understanding this process at a mechanistic level — reproduction,
            mutation, and selection acting together on a spatial grid — is
            essential for designing better dosing strategies and predicting
            outbreaks of resistant strains.
          </p>
          <p className="text-white/70 leading-relaxed font-medium text-lg">
            This platform simulates that process directly, then layers a
            machine-learning model on top to forecast where resistance is
            heading before it dominates the population.
          </p>
        </div>

        <div className="relative rounded-[2.5rem] overflow-hidden h-[30rem] border border-white/10 shadow-2xl shadow-black/50 bg-[#121312]">
          {LAB_IMAGES.map((src, i) => (
            <motion.img
              key={src}
              src={src}
              alt="Laboratory research"
              className="absolute inset-0 w-full h-full object-cover"
              initial={false}
              animate={{ opacity: i === carouselIndex ? 1 : 0, scale: i === carouselIndex ? 1.03 : 1 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d0c] via-black/20 to-transparent" />
        </div>
      </section>

      {/* SECTION 3: Evolution Timeline */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <p className="text-earth-300 font-bold tracking-widest uppercase text-sm mb-4">The Mechanism</p>
          <h2 className="font-bold text-4xl md:text-5xl text-white">
            How Bacteria Evolve Resistance
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {EVOLUTION_STAGES.map((stage, i) => {
            const active = i === activeStage;
            return (
              <motion.div
                key={stage}
                animate={{
                  borderColor: active ? "rgba(110, 231, 183, 0.4)" : "rgba(255, 255, 255, 0.05)",
                  backgroundColor: active ? "rgba(110, 231, 183, 0.05)" : "rgba(255, 255, 255, 0.02)"
                }}
                transition={{ duration: 0.5 }}
                className="rounded-3xl p-6 flex flex-col items-center text-center gap-3 border backdrop-blur-sm"
              >
                <span
                  className={`text-sm font-bold tracking-widest ${
                    active ? "text-earth-300" : "text-white/30"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p
                  className={`font-bold text-sm ${
                    active ? "text-white" : "text-white/50"
                  }`}
                >
                  {stage}
                </p>
                <div className="w-full h-1.5 bg-white/5 mt-2 overflow-hidden rounded-full">
                  <motion.div
                    className="h-full bg-emerald-300"
                    animate={{ width: active ? "100%" : "0%" }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: Features */}
      <section className="max-w-6xl mx-auto px-6 py-20 pb-32">
        <div className="text-center mb-16">
          <p className="text-earth-300 font-bold tracking-widest uppercase text-sm mb-4">Capabilities</p>
          <h2 className="font-bold text-4xl md:text-5xl text-white">
            Project Features
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white/5 border border-white/5 rounded-[2rem] p-8 hover:border-emerald-300/40 transition-all duration-300 backdrop-blur-sm shadow-xl shadow-black/20"
            >
              <h3 className="font-bold text-emerald-300 text-lg tracking-wide mb-3">
                {f.title}
              </h3>
              <p className="font-medium text-white/70 leading-relaxed text-sm">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}