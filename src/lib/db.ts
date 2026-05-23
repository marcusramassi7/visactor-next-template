import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

// Initialize the database connection
const dbPath = path.join(process.cwd(), "data", "database.sqlite");

export async function openDb() {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Enable foreign keys
  await db.exec('PRAGMA foreign_keys = ON;');

  // Ensure the table exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS cidade (
      idcidade INTEGER PRIMARY KEY AUTOINCREMENT,
      nome VARCHAR(45) NULL,
      estado VARCHAR(2) NULL
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS cliente (
      idCliente INTEGER PRIMARY KEY AUTOINCREMENT,
      nome VARCHAR(100) NOT NULL,
      cpf VARCHAR(20) NOT NULL,
      endereco VARCHAR(100) NOT NULL,
      numero INTEGER NOT NULL,
      complemento VARCHAR(45) NULL,
      bairro VARCHAR(45) NOT NULL,
      Cidade_idcidade INTEGER NOT NULL,
      dtnasc DATETIME NULL,
      salario DECIMAL(12,2) NULL,
      ativo INTEGER NOT NULL DEFAULT 1,
      CONSTRAINT fk_Cliente_Cidade
        FOREIGN KEY (Cidade_idcidade)
        REFERENCES cidade (idcidade)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS setor (
      idsetor INTEGER PRIMARY KEY AUTOINCREMENT,
      nome VARCHAR(45) NULL
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS produto (
      idProduto INTEGER PRIMARY KEY AUTOINCREMENT,
      nome VARCHAR(100) NOT NULL,
      descricao VARCHAR(100) NULL,
      preco DECIMAL(12,2) NOT NULL,
      margem_aplicada DECIMAL(3,2) NOT NULL,
      estoque_minimo INTEGER NOT NULL,
      setor_idsetor INTEGER NOT NULL,
      CONSTRAINT fk_Produto_setor
        FOREIGN KEY (setor_idsetor)
        REFERENCES setor (idsetor)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS fornecedor (
      idFornecedor INTEGER PRIMARY KEY AUTOINCREMENT,
      nome VARCHAR(100) NOT NULL,
      cnpj VARCHAR(20) NULL,
      contato VARCHAR(45) NULL
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS produto_fornecedor (
      produto_id INTEGER NOT NULL,
      fornecedor_id INTEGER NOT NULL,
      PRIMARY KEY (produto_id, fornecedor_id),
      FOREIGN KEY (produto_id) REFERENCES produto (idProduto) ON DELETE CASCADE,
      FOREIGN KEY (fornecedor_id) REFERENCES fornecedor (idFornecedor) ON DELETE CASCADE
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS venda (
      idvenda INTEGER PRIMARY KEY AUTOINCREMENT,
      data_venda DATETIME NULL,
      Cliente_idCliente INTEGER NOT NULL,
      tipo VARCHAR(2) NULL,
      forma_pgmt VARCHAR(45) NULL,
      desconto DECIMAL(10,2) NULL DEFAULT 0,
      total DECIMAL(12,2) NULL,
      CONSTRAINT fk_venda_Cliente
        FOREIGN KEY (Cliente_idCliente)
        REFERENCES cliente (idCliente)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS produtos_venda (
      idprodutos_venda INTEGER PRIMARY KEY AUTOINCREMENT,
      Produto_idProduto INTEGER NOT NULL,
      quantidade INTEGER NULL,
      total DECIMAL(12,2) NULL,
      produtos_vendacol DECIMAL(12,2) NULL,
      venda_idvenda INTEGER NOT NULL,
      CONSTRAINT fk_produtos_venda_Produto
        FOREIGN KEY (Produto_idProduto)
        REFERENCES produto (idProduto)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
      CONSTRAINT fk_produtos_venda_venda
        FOREIGN KEY (venda_idvenda)
        REFERENCES venda (idvenda)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
    )
  `);

  return db;
}
