"use server";

import { revalidatePath } from "next/cache";
import { openDb } from "@/lib/db";

export type Fornecedor = {
  idFornecedor: number;
  nome: string;
  cnpj: string | null;
  contato: string | null;
};

export async function getFornecedores(): Promise<Fornecedor[]> {
  const db = await openDb();
  const fornecedores = await db.all<Fornecedor[]>("SELECT * FROM fornecedor");
  return fornecedores;
}

export async function createFornecedor(data: Omit<Fornecedor, "idFornecedor">) {
  const db = await openDb();
  await db.run(
    "INSERT INTO fornecedor (nome, cnpj, contato) VALUES (?, ?, ?)",
    data.nome,
    data.cnpj || null,
    data.contato || null
  );
  revalidatePath("/fornecedores");
}

export async function updateFornecedor(idFornecedor: number, data: Omit<Fornecedor, "idFornecedor">) {
  const db = await openDb();
  await db.run(
    "UPDATE fornecedor SET nome = ?, cnpj = ?, contato = ? WHERE idFornecedor = ?",
    data.nome,
    data.cnpj || null,
    data.contato || null,
    idFornecedor
  );
  revalidatePath("/fornecedores");
}

export async function deleteFornecedor(idFornecedor: number) {
  const db = await openDb();
  await db.run("DELETE FROM fornecedor WHERE idFornecedor = ?", idFornecedor);
  revalidatePath("/fornecedores");
}
