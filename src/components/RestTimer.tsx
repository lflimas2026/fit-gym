import React, { useEffect, useState } from 'react';
import { X, Play, Pause, Square, Plus } from 'lucide-react';

interface RestTimerProps {
  initialSeconds: number;
  onClose: () => void;
}

export default function RestTimer({ initialSeconds, onClose }: RestTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    // Reinicia o timer para o tempo inicial se o componente ganhar um novo tempo de fora
    setSecondsLeft(initialSeconds);
    setIsActive(true);
  }, [initialSeconds]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      // Quando chega a zero, dá um feedback visual e pode fechar ou tocar um alerta
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft]);

  // Formata os segundos para MM:SS
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Botões de ajuste rápido de tempo estilo Fitbod
  const addTime = (amount: number) => {
    setSecondsLeft((prev) => prev + amount);
  };

  // Calcula a percentagem da barra de progresso
  const progressPercentage = (secondsLeft / initialSeconds) * 100;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 max-w-md mx-auto bg-[#0A0A0C]/95 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-4 shadow-[0_10px_30px_rgba(16,185,129,0.1)] flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Linha Principal com o Tempo */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full ${secondsLeft === 0 ? 'bg-red-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
          <div>
            <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Tempo de Descanso</p>
            <p className={`text-xl font-black tracking-tight transition-colors ${secondsLeft === 0 ? 'text-red-400' : 'text-white'}`}>
              {secondsLeft === 0 ? 'Pronto para treinar!' : formatTime(secondsLeft)}
            </p>
          </div>
        </div>

        {/* Controlos de Execução */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => addTime(15)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-bold flex items-center gap-0.5 active:scale-95 transition-all"
            title="+15 Segundos"
          >
            <Plus size={12} />
            15s
          </button>
          
          <button
            onClick={() => setIsActive(!isActive)}
            className={`p-2 rounded-xl border transition-all active:scale-95 ${
              isActive 
                ? 'bg-amber-950/20 border-amber-500/30 text-amber-400' 
                : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
            }`}
          >
            {isActive ? <Pause size={14} /> : <Play size={14} />}
          </button>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 active:scale-95 transition-all"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Barra de Progresso Fluida */}
      <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ease-linear rounded-full ${
            secondsLeft === 0 ? 'bg-red-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${Math.max(0, Math.min(100, progressPercentage))}%` }}
        />
      </div>

    </div>
  );
}
