import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Calendar, Dumbbell, Award } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryDrawer({ isOpen, onClose }: HistoryDrawerProps) {
  const { workoutHistory } = useApp();

  if (!isOpen) return null;

  // Agrupa os logs por data para não repetir a mesma data se vários músculos foram fadigados juntos
  const groupedHistory = workoutHistory.reduce((acc: { [key: string]: string[] }, log) => {
    // Formata a data para o padrão DD/MM/AAAA brasileiro
    const dateKey = new Date(log.date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    if (!acc[dateKey]) acc[dateKey] = [];
    if (!acc[dateKey].includes(log.muscleId)) {
      acc[dateKey].push(log.muscleId);
    }
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col justify-end transition-all">
      {/* Camada de clique fora para fechar */}
      <div className="flex-1" onClick={onClose}></div>
      
      {/* Corpo da Gaveta */}
      <div className="w-full max-w-md bg-[#0A0A0C] border-t border-[#1A1A1E] rounded-t-3xl p-5 flex flex-col max-h-[80vh] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        
        {/* Cabeçalho do Histórico */}
        <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-2">
              <Award size={16} className="text-emerald-400" />
              Histórico de Treinos
            </h3>
            <p className="text-xs text-zinc-500">Sessões concluídas e registradas</p>
          </div>
          <button 
            onClick={onClose} 
            className="bg-zinc-900 p-2 rounded-full text-zinc-400 border border-zinc-800 active:scale-95 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Lista de Itens com Rolagem */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-3 scrollbar-hide">
          {Object.keys(groupedHistory).length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
              <span className="text-2xl">📭</span>
              <p>Nenhum treino registrado no LocalStorage ainda.</p>
              <p className="text-[10px] text-zinc-600 max-w-[200px]">Marque as séries e finalize um treino para ver a mágica aqui.</p>
            </div>
          ) : (
            Object.entries(groupedHistory).map(([date, muscles]) => (
              <div 
                key={date} 
                className="bg-[#121215] border border-[#1F1F24] rounded-xl p-4 flex flex-col gap-3"
              >
                {/* Linha do topo do card histórico */}
                <div className="flex justify-between items-center text-xs border-b border-zinc-900 pb-2">
                  <div className="flex items-center gap-1.5 text-zinc-300 font-bold">
                    <Calendar size={13} className="text-emerald-500" />
                    {date}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-medium">Sessão Concluída</span>
                </div>

                {/* Músculos treinados descritos */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Grupos Estimulados</span>
                  <div className="flex flex-wrap gap-1.5 mt-0.5">
                    {muscles.map((muscle) => (
                      <span 
                        key={muscle}
                        className="text-[9px] text-emerald-400 font-extrabold bg-emerald-950/20 border border-emerald-500/20 px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1"
                      >
                        <Dumbbell size={9} />
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
