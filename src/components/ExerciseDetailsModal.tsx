import React from 'react';
import { X, Info, ShieldCheck, Dumbbell } from 'lucide-react';

interface ExerciseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  equipment: string;
  muscleId: string;
}

export default function ExerciseDetailsModal({ isOpen, onClose, exerciseName, equipment, muscleId }: ExerciseDetailsModalProps) {
  if (!isOpen) return null;

  // Gera instruções técnicas dinâmicas baseadas no tipo de equipamento do exercício
  const getInstructions = () => {
    switch (equipment) {
      case 'barbell':
        return [
          "Mantenha a barra alinhada e faça o movimento de forma controlada.",
          "Ative o abdômen (core) para estabilizar a coluna durante toda a execução.",
          "Não trave completamente as articulações (cotovelos/joelhos) no topo do movimento."
        ];
      case 'dumbbell':
        return [
          "Controle a descida para garantir o máximo de estímulo muscular na fase excêntrica.",
          "Mantenha os punhos firmes e evite balançar o corpo para pegar impulso.",
          "Foque na simetria: certifique-se de que ambos os lados sobem juntos."
        ];
      case 'cable':
        return [
          "Mantenha a tensão constante no cabo, sem deixar as placas baterem no final.",
          "Estabilize os ombros e a postura antes de iniciar a puxada/empunhadura.",
          "Faça a extensão completa da musculatura de forma suave."
        ];
      case 'machine':
        return [
          "Ajuste o banco e os apoios da máquina para alinhar a sua articulação ao eixo do equipamento.",
          "Mantenha as costas firmemente apoiadas no encosto.",
          "Evite usar impulsos violentos; controle tanto a ida quanto a volta."
        ];
      default:
        return [
          "Concentre-se na contração muscular máxima usando o peso do próprio corpo.",
          "Mantenha a cadência controlada para aumentar o tempo sob tensão.",
          "Preze pela execução perfeita antes de tentar acelerar o ritmo."
        ];
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col justify-end transition-all">
      {/* Camada de clique fora para fechar */}
      <div className="flex-1" onClick={onClose}></div>
      
      {/* Corpo do Painel Informativo */}
      <div className="w-full max-w-md bg-[#0A0A0C] border-t border-[#1A1A1E] rounded-t-3xl p-6 flex flex-col max-h-[70vh] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-start pb-4 border-b border-zinc-900">
          <div>
            <span className="text-[9px] text-emerald-400 font-extrabold bg-emerald-950/20 border border-emerald-500/20 px-2.5 py-1 rounded-md uppercase tracking-wider">
              Guia Técnico
            </span>
            <h3 className="text-base font-black text-white tracking-tight mt-2">{exerciseName}</h3>
            <p className="text-xs text-zinc-500 mt-0.5 uppercase tracking-wide font-semibold text-[10px]">
              Foco: {muscleId} • Equipamento: {equipment}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="bg-zinc-900 p-2 rounded-full text-zinc-400 border border-zinc-800 active:scale-95 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Conteúdo das Instruções */}
        <div className="flex-1 overflow-y-auto py-5 flex flex-col gap-4 scrollbar-hide">
          <div className="flex items-start gap-3 bg-[#121215] border border-[#1F1F24] p-4 rounded-xl">
            <Info size={16} className="text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-zinc-200">Como executar corretamente:</p>
              <ul className="list-disc pl-4 text-xs text-zinc-400 mt-2 flex flex-col gap-2">
                {getInstructions().map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-emerald-950/10 border border-emerald-500/10 p-4 rounded-xl">
            <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
            <p className="text-[11px] text-zinc-400">
              <span className="text-zinc-200 font-bold block mb-0.5">Dica do Fit-Gym</span>
              Mantenha a cadência de 2 segundos na subida e 2 segundos na descida para maximizar a hipertrofia.
            </p>
          </div>
        </div>

        {/* Botão de Fechar na base */}
        <button
          onClick={onClose}
          className="w-full bg-zinc-900 hover:bg-zinc-850 text-zinc-200 font-bold text-xs py-3.5 rounded-xl border border-zinc-800 active:scale-[0.98] transition-all"
        >
          Voltar ao Treino
        </button>

      </div>
    </div>
  );
}
