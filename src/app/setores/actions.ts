"use server";

import { revalidatePath } from "next/cache";
import { openDb } from "@/lib/db";

export type Setor = {
  idsetor: number;
  nome: string | null;
};

export async function getSetores(): Promise<Setor[]> {
  const db = await openDb();
  const setores = await db.all<Setor[]>("SELECT * FROM setor");
  return setores;
}

export async function createSetor(nome: string) {
  const db = await openDb();
  await db.run(
    "INSERT INTO setor (nome) VALUES (?)",
    nome || null
  );
  revalidatePath("/setores");
}

export async function updateSetor(idsetor: number, nome: string) {
  const db = await openDb();
  await db.run(
    "UPDATE setor SET nome = ? WHERE idsetor = ?",
    nome || null,
    idsetor
  );
  revalidatePath("/setores");
}

export async function deleteSetor(idsetor: number) {
  const db = await openDb();
  await db.run("DELETE FROM setor WHERE idsetor = ?", idsetor);
  revalidatePath("/setores");
}
