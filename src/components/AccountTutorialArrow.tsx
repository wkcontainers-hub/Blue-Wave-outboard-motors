import React, { useState, useEffect } from 'react';
import { ArrowUp, X } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

interface AccountTutorialArrowProps {
  menuButtonRef?: React.RefObject<HTMLButtonElement | null>;
  onOpenMenu: () => void;
}

export const AccountTutorialArrow: React.FC<AccountTutorialArrowProps> = ({ onOpenMenu }) => {
  const { currentUser, completeTutorial } = useStore();
  const [dismissed, setDismissed] = useState(false);

  // Check if tutorial is already completed for this customer
  const isCompletedOnServer = Boolean(currentUser?.profile?.tutorialCompleted);
  const isCompletedLocally = currentUser
    ? localStorage.getItem(`bw_tutorial_completed_${currentUser.id}`) === 'true'
    : false;

  const shouldShow = Boolean(currentUser && !isCompletedOnServer && !isCompletedLocally && !dismissed);

  // If dismissed or completed, render nothing
  if (!shouldShow) return null;

  const handleDismiss = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDismissed(true);
    completeTutorial();
  };

  const handleAction = () => {
    // When customer taps anywhere on the tutorial or follows the arrow, open menu & permanently complete
    handleDismiss();
    onOpenMenu();
  };

  return (
    <aside
      aria-label="New account guide"
      className="fixed top-16 right-4 sm:right-6 md:right-8 z-50 max-w-sm pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-300"
    >
      <div className="relative flex flex-col items-end">
        {/* Animated Pulsing Arrow pointing up toward the ☰ hamburger icon */}
        <div
          onClick={handleAction}
          className="mr-3 mb-1 cursor-pointer flex flex-col items-center group"
          title="Tap to open your account menu"
        >
          <div className="w-10 h-10 rounded-full bg-[#0088FF] text-white flex items-center justify-center shadow-lg shadow-[#0088FF]/50 animate-bounce transition-transform group-hover:scale-110">
            <ArrowUp className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        {/* Instruction Card */}
        <div
          onClick={handleAction}
          className="bg-[#0B1826] border border-[#0088FF]/60 rounded-2xl p-4 shadow-2xl shadow-black/80 backdrop-blur-md cursor-pointer hover:border-[#0088FF] transition-all max-w-[320px] text-white group"
        >
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#38BDF8] bg-[#0088FF]/15 px-2 py-0.5 rounded">
              Welcome to BlueWave
            </span>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Dismiss tutorial"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-slate-100 font-medium leading-relaxed">
            &ldquo;Tap here to access your orders, profile, cart, messages, support, and payment history.&rdquo;
          </p>

          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-[#38BDF8] font-bold group-hover:underline flex items-center gap-1">
              Open Account Menu &rarr;
            </span>
            <span className="text-slate-400 text-[10px]">Tap to open</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
