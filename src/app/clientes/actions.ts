"use server";

import { revalidatePath } from "next/cache";
import { openDb } from "@/lib/db";

export type Cliente = {
  idCliente: number;
  nome: string;
  cpf: string;
  endereco: string;
  numero: number;
  complemento: string | null;
  bairro: string;
  Cidade_idcidade: number;
  cidade_nome?: string;
  dtnasc: string | null;
  salario: number | null;
  ativo: number;
};

export async function getClientes(): Promise<Cliente[]> {
  const db = await openDb();
  const clientes = await db.all<Cliente[]>(`
    SELECT c.*, ci.nome as cidade_nome 
    FROM cliente c
    LEFT JOIN cidade ci ON c.Cidade_idcidade = ci.idcidade
  `);
  return clientes;
}

export async function createCliente(data: Omit<Cliente, "idCliente" | "cidade_nome">) {
  const db = await openDb();
  await db.run(
    `INSERT INTO cliente (
      nome, cpf, endereco, numero, complemento, bairro, 
      Cidade_idcidade, dtnasc, salario, ativo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    data.nome,
    data.cpf,
    data.endereco,
    data.numero,
    data.complemento || null,
    data.bairro,
    data.Cidade_idcidade,
    data.dtnasc || null,
    data.salario || null,
    data.ativo
  );
  revalidatePath("/clientes");
}

export async function updateCliente(idCliente: number, data: Omit<Cliente, "idCliente" | "cidade_nome">) {
  const db = await openDb();
  await db.run(
    `UPDATE cliente SET 
      nome = ?, cpf = ?, endereco = ?, numero = ?, complemento = ?, 
      bairro = ?, Cidade_idcidade = ?, dtnasc = ?, salario = ?, ativo = ?
    WHERE idCliente = ?`,
    data.nome,
    data.cpf,
    data.endereco,
    data.numero,
    data.complemento || null,
    data.bairro,
    data.Cidade_idcidade,
    data.dtnasc || null,
    data.salario || null,
    data.ativo,
    idCliente
  );
  revalidatePath("/clientes");
}

export async function deleteCliente(idCliente: number) {
  const db = await openDb();
  await db.run("DELETE FROM cliente WHERE idCliente = ?", idCliente);
  revalidatePath("/clientes");
}
