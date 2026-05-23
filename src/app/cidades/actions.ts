"use server";

import { revalidatePath } from "next/cache";
import { openDb } from "@/lib/db";

export type Cidade = {
  idcidade: number;
  nome: string | null;
  estado: string | null;
};

export async function getCidades(): Promise<Cidade[]> {
  const db = await openDb();
  const cidades = await db.all<Cidade[]>("SELECT * FROM cidade");
  return cidades;
}

export async function createCidade(nome: string, estado: string) {
  const db = await openDb();
  await db.run(
    "INSERT INTO cidade (nome, estado) VALUES (?, ?)",
    nome || null,
    estado || null
  );
  revalidatePath("/cidades");
}

export async function updateCidade(idcidade: number, nome: string, estado: string) {
  const db = await openDb();
  await db.run(
    "UPDATE cidade SET nome = ?, estado = ? WHERE idcidade = ?",
    nome || null,
    estado || null,
    idcidade
  );
  revalidatePath("/cidades");
}

export async function deleteCidade(idcidade: number) {
  const db = await openDb();
  await db.run("DELETE FROM cidade WHERE idcidade = ?", idcidade);
  revalidatePath("/cidades");
}
