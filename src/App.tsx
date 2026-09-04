import { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine, type GameCallbacks, type GameStats } from '@/game/engine';
import type { GameMode, Tool } from '@/game/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/game/types';
import { initAudio, sfx } from '@/game/audio';
import { HUD } from '@/components/HUD';
import { StartMenu } from '@/components/StartMenu';
import { GameOverScreen } from '@/components/GameOverScreen';
import { TouchControls } from '@/components/TouchControls';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [mode, setMode] = useState<GameMode>('menu');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [stats, setStats] = useState<GameStats>({ deposited: 0, broken: 0, toxic: 0, totalObjects: 0 });
  const [level, setLevel] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const callbacks: GameCallbacks = {
      onScoreChange: (s) => setScore(s),
      onTimeChange: (t) => setTimeLeft(t),
      onModeChange: (m) => setMode(m),
      onStatsChange: (st) => setStats(st),
    };

    const engine = new GameEngine(canvasRef.current, callbacks);
    engineRef.current = engine;

    // Start render loop even in menu mode (for background animation)
    engine.running = true;
    engine.lastTime = performance.now();
    engine.loop();

    return () => {
      engine.stop();
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    if (!engineRef.current) return;
    const engine = engineRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          engine.setInput({ left: true });
          break;
        case 'ArrowRight':
        case 'KeyD':
          engine.setInput({ right: true });
          break;
        case 'Space':
        case 'ArrowUp':
        case 'KeyW':
        case 'KeyZ':
          engine.setInput({ jump: true });
          e.preventDefault();
          break;
        case 'KeyK':
        case 'KeyF':
          engine.setInput({ action: 'break', actionHeld: true });
          break;
        case 'KeyJ':
        case 'KeyE':
          engine.setInput({ action: 'deposit', actionHeld: true });
          break;
        case 'Enter':
          if (engine.mode === 'menu') {
            initAudio();
            engine.start();
          } else if (engine.mode === 'gameover' || engine.mode === 'victory') {
            engine.start();
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          engine.setInput({ left: false });
          break;
        case 'ArrowRight':
        case 'KeyD':
          engine.setInput({ right: false });
          break;
        case 'Space':
        case 'ArrowUp':
        case 'KeyW':
        case 'KeyZ':
          engine.setInput({ jump: false });
          break;
        case 'KeyK':
        case 'KeyF':
          engine.setInput({ action: null, actionHeld: false });
          break;
        case 'KeyJ':
        case 'KeyE':
          engine.setInput({ action: null, actionHeld: false });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleStart = useCallback(() => {
    initAudio();
    setLevel(1);
    engineRef.current?.start();
  }, []);

  const handleRestart = useCallback(() => {
    setLevel(1);
    engineRef.current?.start();
  }, []);

  const handleTouchInput = useCallback((input: Partial<{
    left: boolean;
    right: boolean;
    jump: boolean;
    action: Tool | null;
    actionHeld: boolean;
  }>) => {
    engineRef.current?.setInput(input);
  }, []);

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden flex items-center justify-center">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full object-contain"
        style={{ touchAction: 'none' }}
      />

      {/* UI Overlays */}
      {mode === 'menu' && <StartMenu onStart={handleStart} />}

      {mode === 'playing' && (
        <>
          <HUD score={score} timeLeft={timeLeft} stats={stats} level={level} />
          {isMobile && <TouchControls onInput={handleTouchInput} />}
          {/* Desktop hint */}
          {!isMobile && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <div className="glass-dark rounded-full px-4 py-2 text-xs text-slate-400 font-bold flex items-center gap-3">
                <span><kbd className="text-yellow-400">←→</kbd> Déplacer</span>
                <span><kbd className="text-yellow-400">ESPACE</kbd> Sauter</span>
                <span><kbd className="text-green-400">E</kbd> Déposer</span>
                <span><kbd className="text-red-400">F</kbd> Casser</span>
              </div>
            </div>
          )}
        </>
      )}

      {(mode === 'gameover' || mode === 'victory') && (
        <GameOverScreen
          score={score}
          stats={stats}
          victory={mode === 'victory'}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default App;
