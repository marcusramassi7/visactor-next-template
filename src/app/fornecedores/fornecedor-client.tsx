"use client";

import { useState } from "react";
import { type Fornecedor, createFornecedor, updateFornecedor, deleteFornecedor } from "./actions";
import { Plus, Edit2, Trash2, X } from "lucide-react";

export default function FornecedorClient({ initialData }: { initialData: Fornecedor[] }) {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "delete">("create");
  const [selectedFornecedor, setSelectedFornecedor] = useState<Fornecedor | null>(null);

  // Form State
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [contato, setContato] = useState("");

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedFornecedor(null);
    setNome("");
    setCnpj("");
    setContato("");
    setIsModalOpen(true);
  };

  const openEditModal = (fornecedor: Fornecedor) => {
    setModalMode("edit");
    setSelectedFornecedor(fornecedor);
    setNome(fornecedor.nome);
    setCnpj(fornecedor.cnpj || "");
    setContato(fornecedor.contato || "");
    setIsModalOpen(true);
  };

  const openDeleteModal = (fornecedor: Fornecedor) => {
    setModalMode("delete");
    setSelectedFornecedor(fornecedor);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFornecedor(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "delete" && selectedFornecedor) {
      await deleteFornecedor(selectedFornecedor.idFornecedor);
      window.location.reload();
      return;
    }

    const data = {
      nome,
      cnpj,
      contato,
    };

    if (modalMode === "create") {
      await createFornecedor(data);
      window.location.reload();
    } else if (modalMode === "edit" && selectedFornecedor) {
      await updateFornecedor(selectedFornecedor.idFornecedor, data);
      window.location.reload();
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Fornecedores</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          <Plus size={16} />
          Novo Fornecedor
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 shadow rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm border-b border-slate-200 dark:border-slate-700">
              <th className="p-4 font-semibold w-16">ID</th>
              <th className="p-4 font-semibold">Nome</th>
              <th className="p-4 font-semibold">CNPJ</th>
              <th className="p-4 font-semibold">Contato</th>
              <th className="p-4 font-semibold text-right w-32">Ações</th>
            </tr>
          </thead>
          <tbody>
            {fornecedores.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  Nenhum fornecedor cadastrado.
                </td>
              </tr>
            ) : (
              fornecedores.map((f) => (
                <tr key={f.idFornecedor} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-sm text-slate-700 dark:text-slate-300">
                  <td className="p-4">{f.idFornecedor}</td>
                  <td className="p-4 font-medium">{f.nome}</td>
                  <td className="p-4">{f.cnpj || "-"}</td>
                  <td className="p-4">{f.contato || "-"}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => openEditModal(f)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(f)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {modalMode === "create" && "Novo Fornecedor"}
                {modalMode === "edit" && "Editar Fornecedor"}
                {modalMode === "delete" && "Excluir Fornecedor"}
              </h2>
              <button onClick={closeModal} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4">
              {modalMode === "delete" ? (
                <div className="mb-6 text-slate-700 dark:text-slate-300">
                  Tem certeza que deseja excluir o fornecedor <strong>{selectedFornecedor?.nome}</strong>?
                  Essa ação não pode ser desfeita.
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Nome *
                    </label>
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Ex: Fornecedor ABC"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      CNPJ
                    </label>
                    <input
                      type="text"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Ex: 00.000.000/0000-00"
                      maxLength={20}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Contato
                    </label>
                    <input
                      type="text"
                      value={contato}
                      onChange={(e) => setContato(e.target.value)}
                      className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Ex: (11) 99999-9999"
                      maxLength={45}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
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
