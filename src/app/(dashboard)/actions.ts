"use server";

import { openDb } from "@/lib/db";

export type DashboardStats = {
  faturamentoLiquido: number;
  faturamentoBruto: number;
  ticketMedio: number;
  totalVendas: number;
  totalItensVendidos: number;
  mediaItensPorVenda: number;
  descontoTotal: number;
  lucroEstimado: number;
  porcentagemDesconto: number;
  vendasPorPeriodo: { data: string; total: number; quantidade: number }[];
  vendasPorFormaPagamento: { forma_pgmt: string; total: number; quantidade: number }[];
  vendasPorSetor: { setor_nome: string; total: number }[];
  topProdutos: { nome: string; quantidade: number; receita: number }[];
  curvaABC: { classe: string; contagem: number; receita: number; porcentagem: number }[];
  produtosBaixaSaida: { nome: string; estoque_minimo: number; total_vendido: number }[];
  ultimasVendas: {
    idvenda: number;
    data_venda: string;
    cliente_nome: string;
    forma_pgmt: string;
    desconto: number;
    total: number;
  }[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = await openDb();

  // 1. Métricas Gerais de Faturamento e Vendas
  const resumoVendas = await db.get<{
    total_liquido: number | null;
    total_desconto: number | null;
    total_vendas: number;
  }>(`
    SELECT 
      SUM(total) AS total_liquido,
      SUM(desconto) AS total_desconto,
      COUNT(idvenda) AS total_vendas
    FROM venda
  `);

  const totalVendas = resumoVendas?.total_vendas || 0;
  const faturamentoLiquido = resumoVendas?.total_liquido || 0;
  const descontoTotal = resumoVendas?.total_desconto || 0;
  const faturamentoBruto = faturamentoLiquido + descontoTotal;

  // Evitar divisão por zero
  const ticketMedio = totalVendas > 0 ? faturamentoLiquido / totalVendas : 0;
  const porcentagemDesconto = faturamentoBruto > 0 ? (descontoTotal / faturamentoBruto) * 100 : 0;

  // 2. Total de itens e PA
  const resumoItens = await db.get<{ total_itens: number | null }>(`
    SELECT SUM(quantidade) AS total_itens FROM produtos_venda
  `);
  const totalItensVendidos = resumoItens?.total_itens || 0;
  const mediaItensPorVenda = totalVendas > 0 ? totalItensVendidos / totalVendas : 0;

  // 3. Lucro Líquido Estimado com base na Margem Aplicada
  const lucroResumo = await db.get<{ lucro: number | null }>(`
    SELECT 
      SUM(pv.quantidade * pv.produtos_vendacol * p.margem_aplicada) AS lucro
    FROM produtos_venda pv
    JOIN produto p ON pv.Produto_idProduto = p.idProduto
  `);
  const lucroBrutoEstimado = lucroResumo?.lucro || 0;
  const lucroEstimado = Math.max(0, lucroBrutoEstimado - descontoTotal);

  // 4. Série Temporal de Vendas (Últimos 30 dias com vendas)
  const vendasPorPeriodo = await db.all<{ data: string; total: number; quantidade: number }[]>(`
    SELECT 
      date(data_venda) AS data,
      SUM(total) AS total,
      COUNT(idvenda) AS quantidade
    FROM venda
    GROUP BY date(data_venda)
    ORDER BY date(data_venda) ASC
    LIMIT 30
  `);

  // 5. Distribuição por Forma de Pagamento
  const vendasPorFormaPagamento = await db.all<{ forma_pgmt: string; total: number; quantidade: number }[]>(`
    SELECT 
      COALESCE(forma_pgmt, 'Não Informado') AS forma_pgmt,
      SUM(total) AS total,
      COUNT(idvenda) AS quantidade
    FROM venda
    GROUP BY forma_pgmt
    ORDER BY total DESC
  `);

  // 6. Faturamento por Setor/Categoria de Produtos
  const vendasPorSetor = await db.all<{ setor_nome: string; total: number }[]>(`
    SELECT 
      s.nome AS setor_nome,
      SUM(pv.total) AS total
    FROM produtos_venda pv
    JOIN produto p ON pv.Produto_idProduto = p.idProduto
    JOIN setor s ON p.setor_idsetor = s.idsetor
    GROUP BY s.idsetor
    ORDER BY total DESC
  `);

  // 7. Top 5 Produtos por Faturamento
  const topProdutos = await db.all<{ nome: string; quantidade: number; receita: number }[]>(`
    SELECT 
      p.nome,
      SUM(pv.quantidade) AS quantidade,
      SUM(pv.total) AS receita
    FROM produtos_venda pv
    JOIN produto p ON pv.Produto_idProduto = p.idProduto
    GROUP BY p.idProduto
    ORDER BY receita DESC
    LIMIT 5
  `);

  // 8. Cálculo de Pareto / Curva ABC de Produtos
  const todosProdutos = await db.all<{ nome: string; receita: number }[]>(`
    SELECT 
      p.nome,
      COALESCE(SUM(pv.total), 0) AS receita
    FROM produto p
    LEFT JOIN produtos_venda pv ON p.idProduto = pv.Produto_idProduto
    GROUP BY p.idProduto
    ORDER BY receita DESC
  `);

  const receitaTotalProdutos = todosProdutos.reduce((acc, p) => acc + p.receita, 0);

  let acumulado = 0;
  let contagemA = 0, receitaA = 0;
  let contagemB = 0, receitaB = 0;
  let contagemC = 0, receitaC = 0;

  todosProdutos.forEach((prod) => {
    acumulado += prod.receita;
    const pctAcumulado = receitaTotalProdutos > 0 ? (acumulado / receitaTotalProdutos) * 100 : 0;

    if (pctAcumulado <= 80) {
      contagemA++;
      receitaA += prod.receita;
    } else if (pctAcumulado <= 95) {
      contagemB++;
      receitaB += prod.receita;
    } else {
      contagemC++;
      receitaC += prod.receita;
    }
  });

  const curvaABC = [
    {
      classe: "Classe A (80% da Receita)",
      contagem: contagemA,
      receita: receitaA,
      porcentagem: receitaTotalProdutos > 0 ? (receitaA / receitaTotalProdutos) * 100 : 0,
    },
    {
      classe: "Classe B (15% da Receita)",
      contagem: contagemB,
      receita: receitaB,
      porcentagem: receitaTotalProdutos > 0 ? (receitaB / receitaTotalProdutos) * 100 : 0,
    },
    {
      classe: "Classe C (5% da Receita)",
      contagem: contagemC,
      receita: receitaC,
      porcentagem: receitaTotalProdutos > 0 ? (receitaC / receitaTotalProdutos) * 100 : 0,
    },
  ].filter(c => c.contagem > 0 || c.receita > 0); // Remove classes vazias caso não haja vendas

  // 9. Produtos com Baixa Saída (Baixo giro ou abaixo do estoque mínimo)
  const produtosBaixaSaida = await db.all<{ nome: string; estoque_minimo: number; total_vendido: number }[]>(`
    SELECT 
      p.nome,
      p.estoque_minimo,
      COALESCE(SUM(pv.quantidade), 0) AS total_vendido
    FROM produto p
    LEFT JOIN produtos_venda pv ON p.idProduto = pv.Produto_idProduto
    GROUP BY p.idProduto
    ORDER BY total_vendido ASC
    LIMIT 5
  `);

  // 10. Últimas 10 Vendas Detalhadas
  const ultimasVendas = await db.all<{
    idvenda: number;
    data_venda: string;
    cliente_nome: string;
    forma_pgmt: string;
    desconto: number;
    total: number;
  }[]>(`
    SELECT 
      v.idvenda,
      v.data_venda,
      COALESCE(c.nome, 'Cliente Consumidor') AS cliente_nome,
      COALESCE(v.forma_pgmt, 'Não Informado') AS forma_pgmt,
      COALESCE(v.desconto, 0) AS desconto,
      COALESCE(v.total, 0) AS total
    FROM venda v
    LEFT JOIN cliente c ON v.Cliente_idCliente = c.idCliente
    ORDER BY v.idvenda DESC
    LIMIT 10
  `);

  return {
    faturamentoLiquido,
    faturamentoBruto,
    ticketMedio,
    totalVendas,
    totalItensVendidos,
    mediaItensPorVenda,
    descontoTotal,
    lucroEstimado,
    porcentagemDesconto,
    vendasPorPeriodo,
    vendasPorFormaPagamento,
    vendasPorSetor,
    topProdutos,
    curvaABC: curvaABC.length > 0 ? curvaABC : [{ classe: "Classe A", contagem: 0, receita: 0, porcentagem: 0 }],
    produtosBaixaSaida,
    ultimasVendas,
  };
}
