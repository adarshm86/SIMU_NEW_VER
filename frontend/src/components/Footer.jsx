export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy-deep/60 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h3 className="font-display text-gold-500 text-lg tracking-wide mb-3">
            M.E.S.
          </h3>
          <p className="font-body text-sm text-medical-white/60 leading-relaxed">
            Microbial Evolution Simulator — a research platform for modeling
            antibiotic resistance dynamics.
          </p>
        </div>
        <div>
          <h4 className="font-data text-xs tracking-[0.25em] text-cyan-soft/80 mb-4">
            PROJECT
          </h4>
          <ul className="space-y-2 text-sm text-medical-white/60 font-body">
            <li>Final Year Major Project</li>
            <li>Department of Biotechnology / CSE</li>
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
        </div>
      </div>
      <div className="border-t border-white/5 py-5 text-center text-xs text-medical-white/40 font-data tracking-wide">
        © {new Date().getFullYear()} Microbial Evolution Simulator. Research use only.
      </div>
    </footer>
  );
}
