import { useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Package, Hammer } from 'lucide-react';
import type { Tool } from '@/game/types';
import { sfx } from '@/game/audio';

interface TouchControlsProps {
  onInput: (input: Partial<{
    left: boolean;
    right: boolean;
    jump: boolean;
    action: Tool | null;
    actionHeld: boolean;
  }>) => void;
}

export function TouchControls({ onInput }: TouchControlsProps) {
  const jumpRef = useRef<HTMLButtonElement>(null);
  const depositHeld = useRef(false);
  const breakHeld = useRef(false);

  // Prevent default touch behavior
  useEffect(() => {
    const prevent = (e: TouchEvent) => e.preventDefault();
    document.addEventListener('touchmove', prevent, { passive: false });
    return () => document.removeEventListener('touchmove', prevent);
  }, []);

  const holdButton = (
    key: 'left' | 'right' | 'jump',
    value: boolean
  ) => (e: React.PointerEvent) => {
    e.preventDefault();
    onInput({ [key]: value } as any);
  };

  const actionButton = (tool: Tool) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      if (tool === 'deposit') depositHeld.current = true;
      else breakHeld.current = true;
      sfx.uiClick();
      onInput({ action: tool, actionHeld: true });
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      if (tool === 'deposit') depositHeld.current = false;
      else breakHeld.current = false;
      onInput({ action: null, actionHeld: false });
    },
    onPointerLeave: (e: React.PointerEvent) => {
      e.preventDefault();
      if (tool === 'deposit' && depositHeld.current) {
        depositHeld.current = false;
        onInput({ action: null, actionHeld: false });
      }
      if (tool === 'break' && breakHeld.current) {
        breakHeld.current = false;
        onInput({ action: null, actionHeld: false });
      }
    },
  });

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
      <div className="flex items-end justify-between p-4 pb-6 sm:pb-8">
        {/* Left side: movement */}
        <div className="flex gap-3 pointer-events-auto">
          <button
            className="touch-btn w-16 h-16 rounded-full glass-dark border-2 border-white/20 flex items-center justify-center active:bg-yellow-400/30 active:border-yellow-400"
            onPointerDown={holdButton('left', true)}
            onPointerUp={holdButton('left', false)}
            onPointerLeave={holdButton('left', false)}
          >
            <ArrowLeft className="w-8 h-8 text-white" />
          </button>
          <button
            className="touch-btn w-16 h-16 rounded-full glass-dark border-2 border-white/20 flex items-center justify-center active:bg-yellow-400/30 active:border-yellow-400"
            onPointerDown={holdButton('right', true)}
            onPointerUp={holdButton('right', false)}
            onPointerLeave={holdButton('right', false)}
          >
            <ArrowRight className="w-8 h-8 text-white" />
          </button>
        </div>

        {/* Right side: jump + actions */}
        <div className="flex items-end gap-3 pointer-events-auto">
          <button
            className="touch-btn w-16 h-16 rounded-full bg-green-500/80 border-2 border-green-300 flex items-center justify-center shadow-lg shadow-green-500/40 active:bg-green-400 active:scale-90"
            {...actionButton('deposit')}
          >
            <Package className="w-8 h-8 text-white" />
          </button>
          <button
            className="touch-btn w-16 h-16 rounded-full bg-red-500/80 border-2 border-red-300 flex items-center justify-center shadow-lg shadow-red-500/40 active:bg-red-400 active:scale-90"
            {...actionButton('break')}
          >
            <Hammer className="w-8 h-8 text-white" />
          </button>
          <button
            ref={jumpRef}
            className="touch-btn w-20 h-20 rounded-full glass-dark border-2 border-white/30 flex items-center justify-center active:bg-yellow-400/30 active:border-yellow-400"
            onPointerDown={holdButton('jump', true)}
            onPointerUp={holdButton('jump', false)}
            onPointerLeave={holdButton('jump', false)}
          >
            <span className="text-white font-black text-sm">SAUT</span>
          </button>
        </div>
      </div>
    </div>
  );
}
