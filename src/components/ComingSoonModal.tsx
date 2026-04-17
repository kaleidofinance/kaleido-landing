"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Rocket } from "lucide-react";

interface ComingSoonModalProps {
  open: boolean;
  product: string;
  onClose: () => void;
}

const ComingSoonModal = ({ open, product, onClose }: ComingSoonModalProps) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
          >
            <div className="relative w-full max-w-sm rounded-2xl border border-[#00ff99]/20 bg-[#0a0f0c]/95 backdrop-blur-xl p-8 text-center shadow-[0_0_60px_rgba(0,255,153,0.1)]">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon */}
              <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-[#00ff99]/10 border border-[#00ff99]/20 flex items-center justify-center">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Rocket className="w-7 h-7 text-[#00ff99]" />
                </motion.div>
              </div>

              {/* Content */}
              <div className="mb-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00ff99]/10 border border-[#00ff99]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff99] animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#00ff99]">Coming Soon</span>
              </div>

              <h3 className="mt-4 text-xl font-bold text-white">{product}</h3>
              <p className="mt-2 text-sm text-white/40 leading-relaxed">
                This product is part of the Kaleido Agentic OS stack and is actively being built.
                Join the testnet to be among the first to access it.
              </p>

              {/* CTA */}
              <div className="mt-6 flex flex-col gap-2">
                <a
                  href="/testnet"
                  className="w-full py-2.5 rounded-xl bg-[#00ff99] text-black text-sm font-bold hover:bg-[#00ff99]/90 transition-all shadow-[0_0_20px_rgba(0,255,153,0.3)]"
                >
                  Join the Testnet
                </a>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:border-white/20 hover:text-white/70 transition-all"
                >
                  Go Back
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ComingSoonModal;
