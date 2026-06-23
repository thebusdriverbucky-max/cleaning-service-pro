import { Sparkles, Brush } from "lucide-react";

export default function SettingsLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[400px] text-center">
      {/* Кастомные ключевые кадры для клининг-эффектов */}
      <style>{`
        @keyframes sweep {
          0%, 100% { transform: rotate(-12deg) translateX(-4px); }
          50% { transform: rotate(18deg) translateX(6px); }
        }
        @keyframes sparkle-pulse {
          0%, 100% { transform: scale(0.8) rotate(0deg); opacity: 0.4; }
          50% { transform: scale(1.3) rotate(15deg); opacity: 1; filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.6)); }
        }
        @keyframes bubble-rise {
          0% { transform: translateY(20px) scale(0.6); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-35px) scale(1.1); opacity: 0; }
        }
        .animate-sweep { animation: sweep 1.6s ease-in-out infinite; }
        .animate-sparkle { animation: sparkle-pulse 2s ease-in-out infinite; }
        .animate-bubble-1 { animation: bubble-rise 1.8s infinite ease-in-out; }
        .animate-bubble-2 { animation: bubble-rise 2.2s infinite ease-in-out; animation-delay: 0.4s; }
        .animate-bubble-3 { animation: bubble-rise 1.5s infinite ease-in-out; animation-delay: 0.8s; }
      `}</style>
      
      <div className="relative flex items-center justify-center w-36 h-36">
        {/* Мыльные пузыри */}
        <div className="absolute w-3 h-3 bg-emerald-200 rounded-full bottom-6 left-6 animate-bubble-1"></div>
        <div className="absolute w-4 h-4 bg-teal-100 rounded-full bottom-4 left-14 animate-bubble-2"></div>
        <div className="absolute w-2.5 h-2.5 bg-sky-200 rounded-full bottom-8 right-8 animate-bubble-3"></div>

        {/* Сияние (Искорки чистоты) */}
        <div className="absolute top-6 right-6 animate-sparkle text-amber-400">
          <Sparkles className="w-6 h-6 fill-amber-400" />
        </div>
        <div className="absolute bottom-6 left-2 animate-sparkle text-emerald-400 [animation-delay:0.7s]">
          <Sparkles className="w-4 h-4 fill-emerald-400" />
        </div>

        {/* Круговая орбита чистки */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-100 animate-spin [animation-duration:10s]" />

        {/* Центральный элемент - Щетка */}
        <div className="relative text-emerald-600 animate-sweep z-10">
          <Brush className="w-16 h-16" />
        </div>
      </div>
      
      <div className="space-y-1.5 mt-4">
        <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
          Наводим порядок в настройках
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 animate-pulse">
          Пожалуйста, подождите, пока мы подгружаем актуальные данные...
        </p>
      </div>
    </div>
  );
}
