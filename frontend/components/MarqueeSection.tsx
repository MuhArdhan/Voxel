"use client";

import { motion } from "framer-motion";

const MARQUEE_ITEMS = [
  "WEAR THE FUTURE",
  "CYBER TECH STREETWEAR",
  "SS26 DROP",
  "LIMITED EDITION",
  "VOXEL®",
  "SYSTEM_ONLINE",
  "WEAR THE FUTURE",
  "CYBER TECH STREETWEAR",
  "SS26 DROP",
  "LIMITED EDITION",
  "VOXEL®",
  "SYSTEM_ONLINE",
];

export default function MarqueeSection() {
  return (
    <div className="py-5 bg-[#0A0A0A] overflow-hidden border-y border-white/5">
      <div className="flex">
        <motion.div
          className="flex items-center gap-8 flex-shrink-0"
          animate={{ x: [0, "-50%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {MARQUEE_ITEMS.concat(MARQUEE_ITEMS).map((item, i) => (
            <div key={i} className="flex items-center gap-8 flex-shrink-0">
              <span className="mono text-xs font-semibold text-white/30 tracking-[0.3em] uppercase whitespace-nowrap">
                {item}
              </span>
              <span className="text-[#00D4FF]/40 text-xs">✦</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
