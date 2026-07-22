import { motion } from "framer-motion";

export default function GlassCard({
  children,
  className = "",
  delay = 0,
  hover = true,
  as: Component = motion.div,
}) {
  return (
    <Component
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={hover ? { y: -4, transition: { duration: 0.25 } } : undefined}
      className={`glass-panel p-6 ${className}`}
    >
      {children}
    </Component>
  );
}
