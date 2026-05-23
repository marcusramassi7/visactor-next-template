"use server";

import { revalidatePath } from "next/cache";
import { openDb } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ClientePDV = {
  idCliente: number;
  nome: string;
  cpf: string;
};

export type ProdutoPDV = {
  idProduto: number;
  nome: string;
  descricao: string | null;
  preco: number;
};

export type ItemCarrinho = {
  produto: ProdutoPDV;
  quantidade: number;
  totalItem: number;
};

export type VendaPayload = {
  Cliente_idCliente: number;
  tipo: string;
  forma_pgmt: string;
  desconto: number;
  itens: { Produto_idProduto: number; quantidade: number; precoUnit: number }[];
};

export type Venda = {
  idvenda: number;
  data_venda: string;
  Cliente_idCliente: number;
  cliente_nome?: string;
  tipo: string | null;
  forma_pgmt: string | null;
  desconto: number;
  total: number;
};

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getClientesPDV(): Promise<ClientePDV[]> {
  const db = await openDb();
  return db.all<ClientePDV[]>(
    "SELECT idCliente, nome, cpf FROM cliente WHERE ativo = 1 ORDER BY nome"
  );
}

export async function getProdutosPDV(): Promise<ProdutoPDV[]> {
  const db = await openDb();
  return db.all<ProdutoPDV[]>(
    "SELECT idProduto, nome, descricao, preco FROM produto ORDER BY nome"
  );
}

export async function getVendas(): Promise<Venda[]> {
  const db = await openDb();
  return db.all<Venda[]>(`
    SELECT v.*, c.nome as cliente_nome
    FROM venda v
    LEFT JOIN cliente c ON v.Cliente_idCliente = c.idCliente
    ORDER BY v.idvenda DESC
  `);
}

export async function getVendaDetalhes(idvenda: number) {
  const db = await openDb();
  const venda = await db.get<Venda>(
    "SELECT v.*, c.nome as cliente_nome FROM venda v LEFT JOIN cliente c ON v.Cliente_idCliente = c.idCliente WHERE v.idvenda = ?",
    idvenda
  );
  const itens = await db.all(`
    SELECT pv.*, p.nome as produto_nome, p.preco as preco_unit
    FROM produtos_venda pv
    LEFT JOIN produto p ON pv.Produto_idProduto = p.idProduto
    WHERE pv.venda_idvenda = ?
  `, idvenda);
  return { venda, itens };
}

// ─── Mutation ─────────────────────────────────────────────────────────────────

export async function createVenda(payload: VendaPayload): Promise<{ success: boolean; error?: string; idvenda?: number }> {
  // ── Validações de negócio ──────────────────────────────────────────────────
  if (!payload.Cliente_idCliente) {
    return { success: false, error: "Selecione um cliente para continuar." };
  }
  if (!payload.itens || payload.itens.length === 0) {
    return { success: false, error: "Adicione pelo menos um produto à venda." };
  }
  if (!payload.forma_pgmt) {
    return { success: false, error: "Selecione a forma de pagamento." };
  }

  // ── Cálculo seguro no backend ──────────────────────────────────────────────
  const subtotal = payload.itens.reduce(
    (sum, item) => sum + item.quantidade * item.precoUnit,
    0
  );
  const desconto = Math.max(0, payload.desconto || 0);
  const total = Math.max(0, subtotal - desconto);

  const db = await openDb();

  try {
    // Inserir venda
    const result = await db.run(
      `INSERT INTO venda (data_venda, Cliente_idCliente, tipo, forma_pgmt, desconto, total)
       VALUES (datetime('now','localtime'), ?, ?, ?, ?, ?)`,
      payload.Cliente_idCliente,
      payload.tipo || "SV",
      payload.forma_pgmt,
      desconto,
      total
    );

    const idvenda = result.lastID!;

    // Inserir itens
    for (const item of payload.itens) {
      const totalItem = item.quantidade * item.precoUnit;
      await db.run(
        `INSERT INTO produtos_venda (Produto_idProduto, quantidade, total, produtos_vendacol, venda_idvenda)
         VALUES (?, ?, ?, ?, ?)`,
        item.Produto_idProduto,
        item.quantidade,
        totalItem,
        item.precoUnit,
        idvenda
      );
    }

    revalidatePath("/pdv");
    return { success: true, idvenda };
  } catch (err: any) {
    console.error("Erro ao criar venda:", err);
    return { success: false, error: "Erro interno ao salvar a venda." };
  }
}
