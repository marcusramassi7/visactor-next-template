import Link from "next/link";
import { getDashboardStats } from "./actions";
import KpiCard from "@/components/dashboard/kpi-card";
import DashboardCharts from "@/components/dashboard/dashboard-charts";
import EmptyState from "@/components/dashboard/empty-state";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Percent,
  ChevronRight,
  Package,
  Users,
  ArrowUpRight,
} from "lucide-react";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr.replace(" ", "T"));
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default async function Home() {
  const stats = await getDashboardStats();

  // Se não houver vendas registradas, renderiza o Estado Vazio Gerencial
  if (stats.totalVendas === 0) {
    return (
      <div className="py-6 px-4 max-w-7xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-1 border-b border-slate-200 dark:border-slate-800 pb-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 uppercase">
            Dashboard Analítico
          </h1>
          <p className="text-xs text-slate-500">
            Acompanhamento de métricas de vendas e giro comercial.
          </p>
        </div>
        <EmptyState />
      </div>
    );
  }

  // Alertas gerenciais baseados em performance real
  const alertas = [];
  if (stats.porcentagemDesconto > 10) {
    alertas.push({
      type: "warning" as const,
      message: `Taxa de desconto alta (${stats.porcentagemDesconto.toFixed(1)}%). Isso pode comprometer o lucro líquido.`,
      icon: Percent,
    });
  }
  if (stats.produtosBaixaSaida.some((p) => p.total_vendido === 0)) {
    alertas.push({
      type: "alert" as const,
      message: "Existem produtos cadastrados com zero vendas no histórico.",
      icon: Package,
    });
  }

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto flex flex-col gap-6 bg-slate-50 dark:bg-slate-950/40">
      
      {/* ─── Cabelho Swiss Brutalism ─── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0 gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">
            Gerenciamento Comercial
          </span>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 uppercase font-sans mt-0.5">
            Painel Executivo de Vendas
          </h1>
        </div>
        <div className="flex items-center gap-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-none font-mono text-slate-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Atualizado: {new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
        </div>
      </div>

      {/* ─── Linha de Cards de KPI (6 no total) ─── */}
      <div className="grid grid-cols-1 gap-4 phone:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-6">
        <KpiCard
          title="Faturamento Líquido"
          value={formatBRL(stats.faturamentoLiquido)}
          variant="highlight"
          icon={DollarSign}
          trend={{
            value: 8.4,
            isPositive: true,
            label: "vs meta trimestral",
          }}
        />
        <KpiCard
          title="Lucro Est. Líquido"
          value={formatBRL(stats.lucroEstimado)}
          variant="success"
          icon={TrendingUp}
          description="Receita menos descontos e custos"
        />
        <KpiCard
          title="Ticket Médio"
          value={formatBRL(stats.ticketMedio)}
          icon={Users}
          trend={{
            value: 2.1,
            isPositive: true,
            label: "acumulado no mês",
          }}
        />
        <KpiCard
          title="Volume de Vendas"
          value={`${stats.totalVendas} ped.`}
          icon={ShoppingBag}
          description="Total de transações executadas"
        />
        <KpiCard
          title="Giro Médio (PA)"
          value={`${stats.mediaItensPorVenda.toFixed(1)} itens`}
          icon={Package}
          description="Média de unidades por pedido"
        />
        <KpiCard
          title="Total Descontos"
          value={formatBRL(stats.descontoTotal)}
          variant={stats.porcentagemDesconto > 10 ? "warning" : "default"}
          icon={Percent}
          trend={{
            value: stats.porcentagemDesconto,
            isPositive: stats.porcentagemDesconto <= 10,
            label: "da receita bruta",
          }}
        />
      </div>

      {/* ─── Grid Assimétrico de Análise Dinâmica ─── */}
      <div className="grid grid-cols-1 gap-6 desktop:grid-cols-12 items-start">
        
        {/* Coluna Principal: Gráficos Interativos (9/12) */}
        <div className="desktop:col-span-9 flex flex-col gap-6">
          <DashboardCharts
            vendasPorPeriodo={stats.vendasPorPeriodo}
            vendasPorFormaPagamento={stats.vendasPorFormaPagamento}
            vendasPorSetor={stats.vendasPorSetor}
            topProdutos={stats.topProdutos}
            curvaABC={stats.curvaABC}
            produtosBaixaSaida={stats.produtosBaixaSaida}
          />
        </div>

        {/* Coluna Lateral: Alertas & Ações Rápidas (3/12) */}
        <div className="desktop:col-span-3 flex flex-col gap-6">
          
          {/* Widget de Alertas Gerenciais */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-none shadow-sm flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-2">
              Alertas de Operação
            </span>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
              Monitoramento Crítico
            </h4>

            {alertas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-slate-400 gap-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-none border border-emerald-100 dark:border-emerald-900/30">
                  ✓
                </div>
                <span>Nenhuma anomalia crítica encontrada na operação.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {alertas.map((a, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 text-xs border ${
                      a.type === "warning"
                        ? "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30"
                        : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
                    }`}
                  >
                    <a.icon size={16} className="shrink-0 mt-0.5" />
                    <span>{a.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Giro de Estoque — Produtos com Baixa Saída */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-none shadow-sm flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-500 mb-2">
              Controle de Giro
            </span>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
              Produtos com Baixa Saída
            </h4>

            <div className="flex flex-col gap-3">
              {stats.produtosBaixaSaida.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 last:border-0 pb-2 last:pb-0"
                >
                  <div className="min-w-0 pr-2">
                    <span className="block text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {p.nome}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Mínimo requerido: {p.estoque_minimo} un.
                    </span>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 border ${
                    p.total_vendido === 0 
                      ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30"
                      : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-850"
                  }`}>
                    {p.total_vendido} un.
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Links Rápidos de Gestão */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-none shadow-sm flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-2">
              Gerência Operacional
            </span>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
              Atalhos de Sistema
            </h4>

            <div className="flex flex-col gap-2">
              <Link
                href="/pdv"
                className="flex items-center justify-between p-2.5 border border-slate-200 dark:border-slate-800 hover:border-orange-400 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-orange-500 transition-colors"
              >
                Abrir Terminal PDV
                <ArrowUpRight size={14} />
              </Link>
              <Link
                href="/produtos"
                className="flex items-center justify-between p-2.5 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-500 transition-colors"
              >
                Gerenciar Produtos
                <ArrowUpRight size={14} />
              </Link>
              <Link
                href="/clientes"
                className="flex items-center justify-between p-2.5 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition-colors"
              >
                Gerenciar Clientes
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* ─── Tabela Analítica de Últimas Vendas (Base Real) ─── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-none shadow-sm shrink-0">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 flex-wrap gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">
              Auditoria de Transações
            </span>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Histórico das Últimas Vendas
            </h3>
          </div>
          <Link
            href="/pdv"
            className="flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors"
          >
            Fazer uma venda no PDV
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="py-2.5 px-3">Pedido</th>
                <th className="py-2.5 px-3">Data/Hora</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3 text-center">Pagamento</th>
                <th className="py-2.5 px-3 text-right">Desconto</th>
                <th className="py-2.5 px-3 text-right">Valor Total</th>
              </tr>
            </thead>
            <tbody>
              {stats.ultimasVendas.map((v) => (
                <tr
                  key={v.idvenda}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-350 transition-colors"
                >
                  <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                    #{v.idvenda}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono">
                    {formatDate(v.data_venda)}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-250 truncate max-w-[180px]">
                    {v.cliente_nome}
                  </td>
                  <td className="py-3 px-3 text-center font-mono">
                    <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      {v.forma_pgmt}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-rose-500">
                    {v.desconto > 0 ? `-${formatBRL(v.desconto)}` : "—"}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                    {formatBRL(v.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
