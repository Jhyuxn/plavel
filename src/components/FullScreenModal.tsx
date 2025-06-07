import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function FullScreenModal({ isOpen, onClose, children }: FullScreenModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 bg-[#1C1C1E] z-50"
        >
          <div className="flex flex-col h-full">
            <header className="flex justify-between items-center px-4 py-3">
              <button onClick={onClose} className="touch-feedback p-2">
                <X className="w-6 h-6" />
              </button>
            </header>
            <div className="flex-1 overflow-auto momentum-scroll">
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 