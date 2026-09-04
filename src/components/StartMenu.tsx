import { useEffect, useState } from 'react';
import { Play, Wrench, Hammer, AlertTriangle, Package, Clock, ChevronRight } from 'lucide-react';
import { sfx } from '@/game/audio';

interface StartMenuProps {
  onStart: () => void;
}

export function StartMenu({ onStart }: StartMenuProps) {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4">
      <div className="glass-dark rounded-3xl p-6 sm:p-10 max-w-2xl w-full animate-scale-in">
        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <Wrench className="w-8 h-8 text-yellow-400" />
            <span className="text-green-400 font-black text-sm tracking-widest uppercase">
              Le Déposeur Sélectif
            </span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-yellow-400 text-stroke leading-tight">
            SUPER DÉPOSEUR
          </h1>
          <p className="text-white text-lg sm:text-xl font-bold mt-1">Le Défi !</p>
        </div>

        {/* Tagline */}
        <p className="text-slate-300 text-center text-sm sm:text-base mb-6 max-w-lg mx-auto">
          Videz le chantier avant la fin du chrono. <span className="text-green-400 font-bold">Déposez</span> pour
          gagner des points, ou <span className="text-red-400 font-bold">cassez</span> pour aller vite... mais
          attention aux voisins !
        </p>

        {/* Action buttons preview */}
        <div className="flex gap-4 justify-center mb-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/50 border-2 border-green-300">
              <Package className="w-8 h-8 text-white" />
            </div>
            <span className="text-green-400 font-bold text-sm">DÉPOSER (+150)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/50 border-2 border-red-300">
              <Hammer className="w-8 h-8 text-white" />
            </div>
            <span className="text-red-400 font-bold text-sm">CASSER (-20)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/50 border-2 border-purple-300">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <span className="text-purple-400 font-bold text-sm">TOXIQUE (-50)</span>
          </div>
        </div>

        {/* Instructions toggle */}
        <button
          onClick={() => {
            sfx.uiClick();
            setShowInstructions(!showInstructions);
          }}
          className="text-slate-400 hover:text-yellow-400 text-sm font-bold mb-4 transition-colors w-full text-center"
        >
          {showInstructions ? 'Masquer' : 'Comment jouer ?'}
        </button>

        {showInstructions && (
          <div className="glass rounded-2xl p-4 mb-6 text-sm text-slate-300 space-y-2 animate-slide-up">
            <div className="flex items-center gap-2">
              <span className="bg-yellow-400 text-slate-900 font-black px-2 py-0.5 rounded text-xs">← →</span>
              <span>Se déplacer sur le chantier</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-yellow-400 text-slate-900 font-black px-2 py-0.5 rounded text-xs">ESPACE</span>
              <span>Sauter par-dessus les obstacles</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-green-500 text-white font-black px-2 py-0.5 rounded text-xs">D</span>
              <span>Maintenir pour déposer un objet (récupère la valeur)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-red-500 text-white font-black px-2 py-0.5 rounded text-xs">F</span>
              <span>Casser (instantané, mais perte de valeur sur les objets)</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-bold">Ne cassez JAMAIS l'amiante ou les bidons toxiques !</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-4 h-4" />
              <span>3 niveaux en 90 secondes. Déposez tout pour gagner !</span>
            </div>
          </div>
        )}

        {/* Play button */}
        <button
          onClick={() => {
            sfx.uiClick();
            onStart();
          }}
          className="btn-press w-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black text-2xl py-4 rounded-2xl shadow-lg shadow-yellow-500/50 flex items-center justify-center gap-3 transition-colors animate-pulse-glow"
        >
          <Play className="w-7 h-7 fill-slate-900" />
          JOUER
        </button>

        {/* Mobile note */}
        <p className="text-slate-500 text-xs text-center mt-4">
          Sur mobile : utilisez les boutons tactiles à l'écran
        </p>
      </div>
    </div>
  );
}
