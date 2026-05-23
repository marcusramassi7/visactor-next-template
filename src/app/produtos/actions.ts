"use server";

import { revalidatePath } from "next/cache";
import { openDb } from "@/lib/db";

export type Produto = {
  idProduto: number;
  nome: string;
  descricao: string | null;
  preco: number;
  margem_aplicada: number;
  estoque_minimo: number;
  setor_idsetor: number;
  setor_nome?: string;
  fornecedor_ids?: number[]; // Added to store associated supplier IDs
};

export async function getProdutos(): Promise<Produto[]> {
  const db = await openDb();
  const produtos = await db.all<Produto[]>(`
    SELECT p.*, s.nome as setor_nome 
    FROM produto p
    LEFT JOIN setor s ON p.setor_idsetor = s.idsetor
  `);

  // Fetch associations for each product
  for (const produto of produtos) {
    const associations = await db.all<{ fornecedor_id: number }[]>(
      "SELECT fornecedor_id FROM produto_fornecedor WHERE produto_id = ?",
      produto.idProduto
    );
    produto.fornecedor_ids = associations.map((a: any) => a.fornecedor_id);
  }

  return produtos;
}

export async function createProduto(data: Omit<Produto, "idProduto" | "setor_nome" | "fornecedor_ids">, fornecedorIds: number[]) {
  const db = await openDb();
  const result = await db.run(
    `INSERT INTO produto (
      nome, descricao, preco, margem_aplicada, estoque_minimo, setor_idsetor
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    data.nome,
    data.descricao || null,
    data.preco,
    data.margem_aplicada,
    data.estoque_minimo,
    data.setor_idsetor
  );

  const newId = result.lastID;

  if (newId && fornecedorIds.length > 0) {
    for (const fId of fornecedorIds) {
      await db.run(
        "INSERT INTO produto_fornecedor (produto_id, fornecedor_id) VALUES (?, ?)",
        newId,
        fId
      );
    }
  }

  revalidatePath("/produtos");
}

export async function updateProduto(idProduto: number, data: Omit<Produto, "idProduto" | "setor_nome" | "fornecedor_ids">, fornecedorIds: number[]) {
  const db = await openDb();
  await db.run(
    `UPDATE produto SET 
      nome = ?, descricao = ?, preco = ?, margem_aplicada = ?, 
      estoque_minimo = ?, setor_idsetor = ?
    WHERE idProduto = ?`,
    data.nome,
    data.descricao || null,
    data.preco,
    data.margem_aplicada,
    data.estoque_minimo,
    data.setor_idsetor,
    idProduto
  );

  // Clear existing associations and re-insert
  await db.run("DELETE FROM produto_fornecedor WHERE produto_id = ?", idProduto);
  if (fornecedorIds.length > 0) {
    for (const fId of fornecedorIds) {
      await db.run(
        "INSERT INTO produto_fornecedor (produto_id, fornecedor_id) VALUES (?, ?)",
        idProduto,
        fId
      );
    }
  }

  revalidatePath("/produtos");
}

export async function deleteProduto(idProduto: number) {
  const db = await openDb();
  // Junction table has ON DELETE CASCADE, so we only need to delete from product
  await db.run("DELETE FROM produto WHERE idProduto = ?", idProduto);
  revalidatePath("/produtos");
}
