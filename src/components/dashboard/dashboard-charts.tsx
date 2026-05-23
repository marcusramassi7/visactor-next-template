"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { VChart } from "@visactor/react-vchart";

type DashboardChartsProps = {
  vendasPorPeriodo: { data: string; total: number; quantidade: number }[];
  vendasPorFormaPagamento: { forma_pgmt: string; total: number; quantidade: number }[];
  vendasPorSetor: { setor_nome: string; total: number }[];
  topProdutos: { nome: string; quantidade: number; receita: number }[];
  curvaABC: { classe: string; contagem: number; receita: number; porcentagem: number }[];
  produtosBaixaSaida: { nome: string; estoque_minimo: number; total_vendido: number }[];
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function DashboardCharts({
  vendasPorPeriodo,
  vendasPorFormaPagamento,
  vendasPorSetor,
  topProdutos,
  curvaABC,
  produtosBaixaSaida: _produtosBaixaSaida,
}: DashboardChartsProps) {
  
  const receitaTotalProdutos = curvaABC.reduce((acc, c) => acc + c.receita, 0);

  // 1. Spec: Tendência Temporal (Linha/Área)
  const tendenciaSpec: any = {
    type: "area",
    data: [
      {
        id: "trend",
        values: vendasPorPeriodo.map((v) => ({
          Data: new Date(v.data + "T00:00:00").toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          }),
          Valor: v.total,
          Volume: v.quantidade,
        })),
      },
    ],
    xField: "Data",
    yField: "Valor",
    color: ["#F97316"], // Laranja Sinal
    axes: [
      {
        orient: "bottom",
        type: "band",
        label: { style: { fill: "#64748B", fontSize: 10 } },
      },
      {
        orient: "left",
        type: "linear",
        label: {
          style: { fill: "#64748B", fontSize: 10 },
          format: (val: number) => `R$ ${val >= 1000 ? (val / 1000).toFixed(1) + "k" : val}`,
        },
      },
    ],
    tooltip: {
      visible: true,
      mark: {
        title: { value: "Resumo do Dia" },
        content: [
          {
            key: "Faturamento",
            value: (d: any) => formatBRL(d.Valor),
          },
          {
            key: "Vendas",
            value: (d: any) => `${d.Volume} ped.`,
          },
        ],
      },
    },
    area: {
      style: {
        fill: "linear-gradient(180deg, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0) 100%)",
      },
    },
    line: {
      style: {
        lineWidth: 3,
      },
    },
  };

  // 2. Spec: Top Produtos (Barras Horizontais)
  const rankingSpec: any = {
    type: "bar",
    direction: "horizontal",
    data: [
      {
        id: "ranking",
        values: [...topProdutos].reverse().map((p) => ({
          Produto: p.nome.length > 20 ? p.nome.substring(0, 18) + "..." : p.nome,
          Faturamento: p.receita,
          Quantidade: p.quantidade,
        })),
      },
    ],
    xField: "Faturamento",
    yField: "Produto",
    color: ["#06B6D4"], // Cyan técnico
    axes: [
      {
        orient: "bottom",
        type: "linear",
        label: {
          style: { fill: "#64748B", fontSize: 10 },
          format: (val: number) => `R$ ${val}`,
        },
      },
      {
        orient: "left",
        type: "band",
        label: { style: { fill: "#64748B", fontSize: 10 } },
      },
    ],
    tooltip: {
      visible: true,
      mark: {
        content: [
          {
            key: "Receita",
            value: (d: any) => formatBRL(d.Faturamento),
          },
          {
            key: "Itens vendidos",
            value: (d: any) => `${d.Quantidade} un.`,
          },
        ],
      },
    },
  };

  // 3. Spec: Forma de Pagamento (Donut)
  const pagamentosSpec: any = {
    type: "pie",
    data: [
      {
        id: "payments",
        values: vendasPorFormaPagamento.map((p) => ({
          Metodo: p.forma_pgmt,
          Total: p.total,
        })),
      },
    ],
    categoryField: "Metodo",
    valueField: "Total",
    innerRadius: 0.6,
    color: ["#F97316", "#10B981", "#06B6D4", "#F59E0B", "#64748B"],
    legends: [
      {
        visible: true,
        orient: "right",
        position: "middle",
        item: {
          label: { style: { fill: "#64748B", fontSize: 11 } },
        },
      },
    ],
    tooltip: {
      visible: true,
      mark: {
        content: [
          {
            key: "Volume Financeiro",
            value: (d: any) => formatBRL(d.Total),
          },
        ],
      },
    },
  };

  // 4. Spec: Vendas por Setor (Barras Verticais)
  const setoresSpec: any = {
    type: "bar",
    data: [
      {
        id: "sectors",
        values: vendasPorSetor.map((s) => ({
          Setor: s.setor_nome,
          Valor: s.total,
        })),
      },
    ],
    xField: "Setor",
    yField: "Valor",
    color: ["#10B981"], // Emerald Green
    axes: [
      {
        orient: "bottom",
        type: "band",
        label: { style: { fill: "#64748B", fontSize: 10 } },
      },
      {
        orient: "left",
        type: "linear",
        label: {
          style: { fill: "#64748B", fontSize: 10 },
          format: (val: number) => `R$ ${val}`,
        },
      },
    ],
    tooltip: {
      visible: true,
      mark: {
        content: [
          {
            key: "Faturamento",
            value: (d: any) => formatBRL(d.Valor),
          },
        ],
      },
    },
  };

  // 5. Spec: Curva ABC Pareto (Donut / Donut Explodido para Segmentos)
  const paretoSpec: any = {
    type: "pie",
    data: [
      {
        id: "pareto",
        values: curvaABC.map((c) => ({
          Classe: c.classe,
          Receita: c.receita,
          Porcentagem: c.porcentagem,
          Contagem: c.contagem,
        })),
      },
    ],
    categoryField: "Classe",
    valueField: "Receita",
    innerRadius: 0.5,
    color: ["#10B981", "#F59E0B", "#EF4444"], // Verde (A), Amarelo (B), Vermelho (C)
    legends: [
      {
        visible: true,
        orient: "bottom",
        position: "middle", // Corrected position to 'middle' (which is start, end, middle or undefined)
        item: {
          label: { style: { fill: "#64748B", fontSize: 10 } },
        },
      },
    ],
    tooltip: {
      visible: true,
      mark: {
        content: [
          {
            key: "Classe",
            value: (d: any) => d.Classe,
          },
          {
            key: "Receita Comercial",
            value: (d: any) => `${formatBRL(d.Receita)} (${d.Porcentagem.toFixed(1)}%)`,
          },
          {
            key: "Variedade de Itens",
            value: (d: any) => `${d.Contagem} produtos`,
          },
        ],
      },
    },
  };

  return (
    <div className="grid grid-cols-1 gap-6 laptop:grid-cols-2">
      {/* 1. Tendência Temporal */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-none shadow-sm flex flex-col h-[320px]">
        <div className="mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">
            Performance Histórica
          </span>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Tendência Temporal de Vendas (Faturamento diário)
          </h4>
        </div>
        <div className="flex-1 min-h-0 relative">
          {vendasPorPeriodo.length > 0 ? (
            <VChart spec={tendenciaSpec} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
              Dados históricos insuficientes para traçar tendência.
            </div>
          )}
        </div>
      </div>

      {/* 2. Top Produtos (Barras Horizontais) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-none shadow-sm flex flex-col h-[320px]">
        <div className="mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-500">
            Mix de Vendas
          </span>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Ranking Dinâmico — Top 5 Produtos por Receita
          </h4>
        </div>
        <div className="flex-1 min-h-0 relative">
          {topProdutos.length > 0 ? (
            <VChart spec={rankingSpec} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
              Sem dados de produtos disponíveis.
            </div>
          )}
        </div>
      </div>

      {/* 3. Meios de Pagamento */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-none shadow-sm flex flex-col h-[320px]">
        <div className="mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
            Fluxo de Caixa
          </span>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Participação de Faturamento por Meio de Pagamento
          </h4>
        </div>
        <div className="flex-1 min-h-0 relative">
          {vendasPorFormaPagamento.length > 0 ? (
            <VChart spec={pagamentosSpec} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
              Nenhuma transação financeira registrada.
            </div>
          )}
        </div>
      </div>

      {/* 4. Curva ABC de Produtos */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-none shadow-sm flex flex-col h-[320px]">
        <div className="mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
            Princípio de Pareto (80/20)
          </span>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Curva ABC — Concentração Comercial da Receita
          </h4>
        </div>
        <div className="flex-1 min-h-0 relative">
          {receitaTotalProdutos > 0 ? (
            <VChart spec={paretoSpec} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
              Realize vendas para mapear a concentração da receita.
            </div>
          )}
        </div>
      </div>

      {/* 5. Vendas por Setor */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-none shadow-sm flex flex-col h-[320px] laptop:col-span-2">
        <div className="mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
            Faturamento por Categoria
          </span>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Desempenho Comercial por Setor do Estabelecimento
          </h4>
        </div>
        <div className="flex-1 min-h-0 relative">
          {vendasPorSetor.length > 0 ? (
            <VChart spec={setoresSpec} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
              Sem dados por categoria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
