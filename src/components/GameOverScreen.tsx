import { useState, useEffect } from 'react';
import { RotateCcw, Mail, Trophy, ChevronRight, CheckCircle2, Wrench } from 'lucide-react';
import { sfx } from '@/game/audio';
import { submitLead, getTopScores, type LeadEntry } from '@/lib/supabase';
import type { GameStats } from '@/game/engine';
import { COLORS } from '@/game/types';

interface GameOverScreenProps {
  score: number;
  stats: GameStats;
  victory: boolean;
  onRestart: () => void;
}

export function GameOverScreen({ score, stats, victory, onRestart }: GameOverScreenProps) {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [topScores, setTopScores] = useState<LeadEntry[]>([]);
  const [loadingScores, setLoadingScores] = useState(true);

  useEffect(() => {
    getTopScores(5).then((scores) => {
      setTopScores(scores);
      setLoadingScores(false);
    });
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    const { error } = await submitLead(email, name || null, score);
    setSubmitting(false);
    if (error) {
      setSubmitError(error);
    } else {
      setSubmitted(true);
      sfx.victory();
      // Refresh scores
      const scores = await getTopScores(5);
      setTopScores(scores);
    }
  };

  const title = victory ? 'EXPERTISE TOTALE !' : 'CHANTIER TERMINÉ !';
  const subtitle = victory
    ? 'Le chantier est propre et tout est valorisé !'
    : 'Le temps est écoulé !';

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-dark rounded-3xl p-6 sm:p-8 max-w-lg w-full animate-scale-in my-auto">
        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <Wrench className="w-6 h-6 text-yellow-400" />
          </div>
          <h1
            className="text-4xl sm:text-5xl font-black text-stroke leading-tight"
            style={{ color: victory ? COLORS.accent : COLORS.primary }}
          >
            {title}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2">{subtitle}</p>
        </div>

        {/* Score */}
        <div className="glass rounded-2xl p-4 mb-4 text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Score Final</p>
          <p className="text-yellow-400 font-black text-5xl text-stroke-sm">{score.toLocaleString()}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-green-400 font-black text-2xl">{stats.deposited}</p>
            <p className="text-slate-400 text-xs font-bold">Déposés</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-red-400 font-black text-2xl">{stats.broken}</p>
            <p className="text-slate-400 text-xs font-bold">Cassés</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-purple-400 font-black text-2xl">{stats.toxic}</p>
            <p className="text-slate-400 text-xs font-bold">Toxiques</p>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="glass rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-bold text-sm">Meilleurs Scores</span>
          </div>
          {loadingScores ? (
            <p className="text-slate-500 text-sm text-center py-2">Chargement...</p>
          ) : topScores.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-2">Soyez le premier à inscrire votre score !</p>
          ) : (
            <div className="space-y-1">
              {topScores.map((entry, i) => (
                <div key={entry.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className={`font-black w-5 text-center ${
                        i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-slate-500'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-slate-300 font-bold">
                      {entry.name || entry.email.split('@')[0]}
                    </span>
                  </span>
                  <span className="text-yellow-400 font-black tabular-nums">{entry.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lead form */}
        {!submitted && !showForm && (
          <button
            onClick={() => {
              sfx.uiClick();
              setShowForm(true);
            }}
            className="btn-press w-full bg-green-500 hover:bg-green-400 text-white font-black text-base py-3 rounded-2xl shadow-lg shadow-green-500/40 flex items-center justify-center gap-2 transition-colors mb-3"
          >
            <Mail className="w-5 h-5" />
            Enregistrez votre score & tentez un cadeau pro !
          </button>
        )}

        {showForm && !submitted && (
          <div className="glass rounded-2xl p-4 mb-3 animate-slide-up">
            <p className="text-slate-300 text-sm mb-3 font-bold">
              Inscrivez votre score pour participer au tirage au sort mensuel !
            </p>
            <input
              type="email"
              placeholder="Votre email pro"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800/80 text-white rounded-xl px-4 py-3 mb-2 text-sm font-medium border border-slate-600 focus:border-yellow-400 focus:outline-none transition-colors"
            />
            <input
              type="text"
              placeholder="Votre nom (optionnel)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800/80 text-white rounded-xl px-4 py-3 mb-3 text-sm font-medium border border-slate-600 focus:border-yellow-400 focus:outline-none transition-colors"
            />
            {submitError && (
              <p className="text-red-400 text-xs font-bold mb-2">{submitError}</p>
            )}
            <button
              onClick={handleSubmit}
              disabled={submitting || !email}
              className="btn-press w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {submitting ? 'Envoi...' : 'Enregistrer mon score'}
              {!submitting && <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        )}

        {submitted && (
          <div className="glass rounded-2xl p-4 mb-3 animate-slide-up text-center">
            <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-green-400 font-bold text-sm">Score enregistré ! Bonne chance pour le tirage !</p>
          </div>
        )}

        {/* CTA + Restart */}
        <div className="flex gap-2">
          <a
            href="https://www.le-deposeur-selectif.fr"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sfx.uiClick()}
            className="btn-press flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors"
          >
            <Wrench className="w-4 h-4" />
            Notre expertise
          </a>
          <button
            onClick={() => {
              sfx.uiClick();
              onRestart();
            }}
            className="btn-press flex-1 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black text-sm py-3 rounded-2xl shadow-lg shadow-yellow-500/40 flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Rejouer
          </button>
        </div>
      </div>
    </div>
  );
}
