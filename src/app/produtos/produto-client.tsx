"use client";

import { useState } from "react";
import { type Produto, createProduto, updateProduto, deleteProduto } from "./actions";
import { type Setor } from "../setores/actions";
import { type Fornecedor } from "../fornecedores/actions"; // Added import
import { Plus, Edit2, Trash2, X } from "lucide-react";

export default function ProdutoClient({ initialData, setores, fornecedores }: { initialData: Produto[], setores: Setor[], fornecedores: Fornecedor[] }) {
  const [produtos, setProdutos] = useState<Produto[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "delete">("create");
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);

  // Form State
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState<number | "">("");
  const [margemAplicada, setMargemAplicada] = useState<number | "">("");
  const [estoqueMinimo, setEstoqueMinimo] = useState<number | "">("");
  const [setorId, setSetorId] = useState<number | "">("");
  const [selectedFornecedores, setSelectedFornecedores] = useState<number[]>([]); // New state

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedProduto(null);
    setNome("");
    setDescricao("");
    setPreco("");
    setMargemAplicada("");
    setEstoqueMinimo("");
    setSetorId("");
    setSelectedFornecedores([]);
    setIsModalOpen(true);
  };

  const openEditModal = (produto: Produto) => {
    setModalMode("edit");
    setSelectedProduto(produto);
    setNome(produto.nome);
    setDescricao(produto.descricao || "");
    setPreco(produto.preco);
    setMargemAplicada(produto.margem_aplicada);
    setEstoqueMinimo(produto.estoque_minimo);
    setSetorId(produto.setor_idsetor);
    setSelectedFornecedores(produto.fornecedor_ids || []);
    setIsModalOpen(true);
  };

  const toggleFornecedor = (id: number) => {
    setSelectedFornecedores(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const openDeleteModal = (produto: Produto) => {
    setModalMode("delete");
    setSelectedProduto(produto);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduto(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "delete" && selectedProduto) {
      await deleteProduto(selectedProduto.idProduto);
      window.location.reload();
      return;
    }

    const data = {
      nome,
      descricao: descricao || null,
      preco: Number(preco),
      margem_aplicada: Number(margemAplicada),
      estoque_minimo: Number(estoqueMinimo),
      setor_idsetor: Number(setorId),
    };

    if (modalMode === "create") {
      await createProduto(data, selectedFornecedores);
      window.location.reload();
    } else if (modalMode === "edit" && selectedProduto) {
      await updateProduto(selectedProduto.idProduto, data, selectedFornecedores);
      window.location.reload();
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Produtos</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          <Plus size={16} />
          Novo Produto
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 shadow rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm border-b border-slate-200 dark:border-slate-700">
              <th className="p-4 font-semibold w-16">ID</th>
              <th className="p-4 font-semibold">Nome</th>
              <th className="p-4 font-semibold">Preço</th>
              <th className="p-4 font-semibold">Estoque Mín.</th>
              <th className="p-4 font-semibold">Setor</th>
              <th className="p-4 font-semibold text-right w-32">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  Nenhum produto cadastrado.
                </td>
              </tr>
            ) : (
              produtos.map((produto) => (
                <tr key={produto.idProduto} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-sm text-slate-700 dark:text-slate-300">
                  <td className="p-4">{produto.idProduto}</td>
                  <td className="p-4 font-medium">{produto.nome}</td>
                  <td className="p-4">R$ {Number(produto.preco).toFixed(2)}</td>
                  <td className="p-4">{produto.estoque_minimo}</td>
                  <td className="p-4">{produto.setor_nome || "N/A"}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => openEditModal(produto)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(produto)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {modalMode === "create" && "Novo Produto"}
                {modalMode === "edit" && "Editar Produto"}
                {modalMode === "delete" && "Excluir Produto"}
              </h2>
              <button onClick={closeModal} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4">
              {modalMode === "delete" ? (
                <div className="mb-6 text-slate-700 dark:text-slate-300">
                  Tem certeza que deseja excluir o produto <strong>{selectedProduto?.nome}</strong>?
                  Essa ação não pode ser desfeita.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Nome */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome *</label>
                    <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} maxLength={100} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  {/* Descrição */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                    <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={100} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  {/* Preço */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Preço *</label>
                    <input type="number" step="0.01" required value={preco} onChange={(e) => setPreco(e.target.value ? Number(e.target.value) : "")} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  {/* Margem Aplicada */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Margem Aplicada *</label>
                    <input type="number" step="0.01" required value={margemAplicada} onChange={(e) => setMargemAplicada(e.target.value ? Number(e.target.value) : "")} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  {/* Estoque Mínimo */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estoque Mínimo *</label>
                    <input type="number" required value={estoqueMinimo} onChange={(e) => setEstoqueMinimo(e.target.value ? Number(e.target.value) : "")} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  {/* Setor (Dropdown) */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Setor *</label>
                    <select required value={setorId} onChange={(e) => setSetorId(Number(e.target.value))} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="" disabled>Selecione um setor...</option>
                      {setores.map(s => (
                        <option key={s.idsetor} value={s.idsetor}>{s.nome}</option>
                      ))}
                    </select>
                  </div>

                  {/* Fornecedores (Checkboxes) */}
                  <div className="md:col-span-2 mt-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Fornecedores (Opcional)</label>
                    <div className="grid grid-cols-2 gap-2 border border-slate-200 dark:border-slate-700 rounded-md p-3 max-h-40 overflow-y-auto">
                      {fornecedores.length === 0 ? (
                        <p className="text-xs text-slate-500 col-span-2 italic">Nenhum fornecedor cadastrado.</p>
                      ) : (
                        fornecedores.map(f => (
                          <label key={f.idFornecedor} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-1 rounded transition-colors">
                            <input 
                              type="checkbox" 
                              checked={selectedFornecedores.includes(f.idFornecedor)}
                              onChange={() => toggleFornecedor(f.idFornecedor)}
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300 truncate" title={f.nome}>
                              {f.nome}
                            </span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={
                    modalMode === "delete"
                      ? "px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                      : "px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  }
                >
                  {modalMode === "delete" ? "Excluir" : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
