import { useEffect, useState } from "react";

function FloatingSpores() {
  const spores = Array.from({ length: 14 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {spores.map((_, i) => {
        const left = (i * 137.5) % 100; // golden-angle spread
        const delay = (i * 1.7) % 12;
        const duration = 10 + (i % 5) * 2.5;
        const size = 2 + (i % 3);
        return (
          <span
            key={i}
            className="absolute rounded-full bg-gold-500/40"
            style={{
              left: `${left}%`,
              bottom: "-10px",
              width: size,
              height: size,
              animation: `mesRise ${duration}s linear ${delay}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}

export default function Footer() {
  const [gen, setGen] = useState(1284);

  useEffect(() => {
    const id = setInterval(() => setGen((g) => g + 1), 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="relative mt-24 overflow-hidden bg-navy-deep">
      <style>{`
        @keyframes mesRise {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(-420px) translateX(24px); opacity: 0; }
        }
        @keyframes mesShimmer {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes mesRotateSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes mesRotateSlowRev {
          from { transform: rotate(360deg); }
          to   { transform: rotate(0deg); }
        }
        @keyframes mesSweep {
          0%   { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }
        @keyframes mesMarquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes mesPulseGlow {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50%      { opacity: 0.65; transform: scale(1.08); }
        }
        .mes-shimmer-text {
          background: linear-gradient(90deg, #F2A541 0%, #FDE68A 25%, #F2A541 50%, #FDE68A 75%, #F2A541 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: mesShimmer 5s linear infinite;
        }
        .mes-btn-sweep::before {
          content: "";
          position: absolute;
          top: 0; left: 0;
          width: 40%;
          height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.55), transparent);
          transform: translateX(-120%);
        }
        .mes-btn-sweep:hover::before {
          animation: mesSweep 1s ease forwards;
        }
      `}</style>

      {/* ambient glow orbs */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[380px] rounded-full bg-gold-500/10 blur-[110px]"
        style={{ animation: "mesPulseGlow 6s ease-in-out infinite" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-10 w-[380px] h-[260px] rounded-full bg-cyan-soft/10 blur-[100px]"
        style={{ animation: "mesPulseGlow 7s ease-in-out infinite 1s" }}
      />
      <FloatingSpores />

      {/* top hairline with traveling glow */}
      <div className="relative h-px w-full bg-white/10 overflow-hidden">
        <div
          className="absolute inset-y-0 w-40 bg-gradient-to-r from-transparent via-gold-500 to-transparent"
          style={{ animation: "mesSweep 3.5s linear infinite" }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-10 flex flex-col items-center text-center">
        {/* rotating emblem */}
        <div className="relative w-20 h-20 mb-10">
          <div
            className="absolute inset-0 rounded-full border border-gold-500/40"
            style={{ animation: "mesRotateSlow 14s linear infinite" }}
          >
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gold-500 shadow-[0_0_10px_3px_rgba(242,165,65,0.6)]" />
          </div>
          <div
            className="absolute inset-3 rounded-full border border-cyan-soft/30"
            style={{ animation: "mesRotateSlowRev 9s linear infinite" }}
          >
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-soft shadow-[0_0_8px_2px_rgba(94,234,212,0.6)]" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center font-display text-gold-500 text-lg tracking-widest">
            M
          </div>
        </div>
<<<<<<< HEAD

        <div className="grid gap-10 text-left w-full mt-2 md:grid-cols-2 xl:grid-cols-4">
          <div className="md:col-span-2 xl:col-span-1">
            <h3 className="font-display text-gold-500 text-lg tracking-wide mb-3">
              M.E.S.
            </h3>
            <p className="font-body text-sm text-medical-white/60 leading-relaxed max-w-md">
              Microbial Evolution Simulator — a research platform for modeling
              antibiotic resistance dynamics.
            </p>
            <p className="font-data text-[11px] tracking-[0.35em] text-cyan-soft/70 mt-8 mb-4">
              THE COLONY CONTINUES TO EVOLVE
            </p>
            <h3 className="font-display text-3xl md:text-4xl mes-shimmer-text mb-5 leading-tight">
              Resistance, Rendered in Real Time
            </h3>
            <p className="font-body text-sm text-medical-white/50 max-w-md mb-8">
              Every mutation logged. Every generation observed. Step into the
              laboratory and watch evolution decide who survives.
            </p>
            <a
              href="#laboratory"
              className="mes-btn-sweep relative inline-flex overflow-hidden rounded-full bg-gradient-to-r from-gold-500 to-gold-400 text-navy-deep font-data text-xs tracking-[0.2em] px-10 py-4 transition-all duration-300 hover:shadow-[0_0_40px_rgba(242,165,65,0.55)] hover:-translate-y-1"
            >
              LAUNCH LABORATORY
            </a>
            <div className="flex flex-wrap items-center gap-4 mt-10 font-data text-[11px] tracking-[0.2em] text-medical-white/40">
              <a href="#" className="hover:text-gold-500 transition-colors duration-300">
                GITHUB
              </a>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <a href="#" className="hover:text-gold-500 transition-colors duration-300">
                CONTACT
              </a>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <a href="#" className="hover:text-gold-500 transition-colors duration-300">
                LAB NOTES
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-data text-xs tracking-[0.25em] text-cyan-soft/80 mb-4">
              PROJECT
            </h4>
            <ul className="space-y-2 text-sm text-medical-white/60 font-body">
              <li>2026</li>
              <li>Department of ISE</li>
              <li>Academic Year 2025-2026</li>
            </ul>
          </div>
          <div>
            <h4 className="font-data text-xs tracking-[0.25em] text-cyan-soft/80 mb-4">
              INSTITUTION
            </h4>
            <ul className="space-y-2 text-sm text-medical-white/60 font-body">
              <li>Your College / University Name</li>
              <li>School of Engineering</li>
            </ul>
          </div>
          <div>
            <h4 className="font-data text-xs tracking-[0.25em] text-cyan-soft/80 mb-4">
              CONNECT
            </h4>
            <ul className="space-y-2 text-sm text-medical-white/60 font-body">
              <li>github.com/your-repo-placeholder</li>
              <li>contact@your-email-placeholder.edu</li>
            </ul>
          </div>
        </div>
        <div>
          <h4 className="font-data text-xs tracking-[0.25em] text-cyan-soft/80 mb-4">
            PROJECT
          </h4>
          <ul className="space-y-2 text-sm text-medical-white/60 font-body">
            <li>2026</li>
            <li>Department of ISE</li>
            <li>Academic Year 2025–2026</li>
          </ul>
        </div>
        <div>
          <h4 className="font-data text-xs tracking-[0.25em] text-cyan-soft/80 mb-4">
            INSTITUTION
          </h4>
          <ul className="space-y-2 text-sm text-medical-white/60 font-body">
            <li>Your College / University Name</li>
            <li>School of Engineering</li>
          </ul>
        </div>
        <div>
          <h4 className="font-data text-xs tracking-[0.25em] text-cyan-soft/80 mb-4">
            CONNECT
          </h4>
          <ul className="space-y-2 text-sm text-medical-white/60 font-body">
            <li>github.com/your-repo-placeholder</li>
            <li>contact@your-email-placeholder.edu</li>
          </ul>
>>>>>>> fed1b6f4b31c63bd7c9caa0618d6ee63ce0a72b3
        </div>
      </div>

      {/* infinite marquee ticker */}
      <div className="relative border-y border-white/10 py-3 overflow-hidden bg-white/[0.02]">
        <div
          className="flex whitespace-nowrap font-data text-[11px] tracking-[0.3em] text-medical-white/30"
          style={{ animation: "mesMarquee 22s linear infinite", width: "200%" }}
        >
          {Array.from({ length: 2 }).map((_, row) => (
            <span key={row} className="flex shrink-0 w-1/2 justify-around">
              <span>GENOME SEQUENCED</span>
              <span className="text-gold-500/50">◆</span>
              <span>MUTATION LOGGED</span>
              <span className="text-cyan-soft/50">◆</span>
              <span>RESISTANCE TRACKED</span>
              <span className="text-gold-500/50">◆</span>
              <span>GENERATION {gen.toLocaleString()}</span>
              <span className="text-cyan-soft/50">◆</span>
            </span>
          ))}
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-6 flex items-center justify-center">
        <p className="font-data text-[11px] tracking-wide text-medical-white/30">
          © {new Date().getFullYear()} Microbial Evolution Simulator — Research use only
        </p>
      </div>
    </footer>
  );
}