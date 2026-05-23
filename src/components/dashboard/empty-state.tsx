import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-12 text-center rounded-none shadow-sm min-h-[450px]">
      <div className="p-4 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/30 rounded-none mb-6">
        <ShoppingBag size={48} strokeWidth={1.5} />
      </div>

      <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-2">
        Base de dados vazia
      </span>
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight max-w-md">
        Nenhuma venda registrada na sua operação comercial
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-2 mb-8">
        Para carregar métricas, rankings dinâmicos, Curva ABC e tendências temporais, registre a sua primeira transação no Terminal de Ponto de Venda (PDV).
      </p>

      <Link
        href="/pdv"
        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white px-6 py-3 font-semibold text-sm transition-all duration-200 shadow-md rounded-none"
      >
        Acessar Terminal PDV
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
