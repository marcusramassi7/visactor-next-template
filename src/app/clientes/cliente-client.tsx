"use client";

import { useState } from "react";
import { type Cliente, createCliente, updateCliente, deleteCliente } from "./actions";
import { type Cidade } from "../cidades/actions";
import { Plus, Edit2, Trash2, X } from "lucide-react";

export default function ClienteClient({ initialData, cidades }: { initialData: Cliente[], cidades: Cidade[] }) {
  const [clientes, setClientes] = useState<Cliente[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "delete">("create");
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  // Form State
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState<number | "">("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidadeId, setCidadeId] = useState<number | "">("");
  const [dtnasc, setDtnasc] = useState("");
  const [salario, setSalario] = useState<number | "">("");
  const [ativo, setAtivo] = useState(1);

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedCliente(null);
    setNome("");
    setCpf("");
    setEndereco("");
    setNumero("");
    setComplemento("");
    setBairro("");
    setCidadeId("");
    setDtnasc("");
    setSalario("");
    setAtivo(1);
    setIsModalOpen(true);
  };

  const openEditModal = (cliente: Cliente) => {
    setModalMode("edit");
    setSelectedCliente(cliente);
    setNome(cliente.nome);
    setCpf(cliente.cpf);
    setEndereco(cliente.endereco);
    setNumero(cliente.numero);
    setComplemento(cliente.complemento || "");
    setBairro(cliente.bairro);
    setCidadeId(cliente.Cidade_idcidade);
    setDtnasc(cliente.dtnasc || "");
    setSalario(cliente.salario || "");
    setAtivo(cliente.ativo);
    setIsModalOpen(true);
  };

  const openDeleteModal = (cliente: Cliente) => {
    setModalMode("delete");
    setSelectedCliente(cliente);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCliente(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "delete" && selectedCliente) {
      await deleteCliente(selectedCliente.idCliente);
      window.location.reload();
      return;
    }

    const data = {
      nome,
      cpf,
      endereco,
      numero: Number(numero),
      complemento,
      bairro,
      Cidade_idcidade: Number(cidadeId),
      dtnasc: dtnasc || null,
      salario: salario ? Number(salario) : null,
      ativo,
    };

    if (modalMode === "create") {
      await createCliente(data);
      window.location.reload();
    } else if (modalMode === "edit" && selectedCliente) {
      await updateCliente(selectedCliente.idCliente, data);
      window.location.reload();
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Clientes</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          <Plus size={16} />
          Novo Cliente
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 shadow rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm border-b border-slate-200 dark:border-slate-700">
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Nome</th>
              <th className="p-4 font-semibold">CPF</th>
              <th className="p-4 font-semibold">Cidade</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  Nenhum cliente cadastrado.
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr key={cliente.idCliente} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-sm text-slate-700 dark:text-slate-300">
                  <td className="p-4">{cliente.idCliente}</td>
                  <td className="p-4 font-medium">{cliente.nome}</td>
                  <td className="p-4">{cliente.cpf}</td>
                  <td className="p-4">{cliente.cidade_nome || "N/A"}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${cliente.ativo === 1 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {cliente.ativo === 1 ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => openEditModal(cliente)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(cliente)}
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
                {modalMode === "create" && "Novo Cliente"}
                {modalMode === "edit" && "Editar Cliente"}
                {modalMode === "delete" && "Excluir Cliente"}
              </h2>
              <button onClick={closeModal} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4">
              {modalMode === "delete" ? (
                <div className="mb-6 text-slate-700 dark:text-slate-300">
                  Tem certeza que deseja excluir o cliente <strong>{selectedCliente?.nome}</strong>?
                  Essa ação não pode ser desfeita.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Nome */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome *</label>
                    <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} maxLength={100} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  {/* CPF */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CPF *</label>
                    <input type="text" required value={cpf} onChange={(e) => setCpf(e.target.value)} maxLength={20} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  {/* Data de Nascimento */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data de Nascimento</label>
                    <input type="date" value={dtnasc} onChange={(e) => setDtnasc(e.target.value)} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  {/* Endereço */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Endereço *</label>
                    <input type="text" required value={endereco} onChange={(e) => setEndereco(e.target.value)} maxLength={100} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  {/* Número */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Número *</label>
                    <input type="number" required value={numero} onChange={(e) => setNumero(e.target.value ? Number(e.target.value) : "")} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  {/* Complemento */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Complemento</label>
                    <input type="text" value={complemento} onChange={(e) => setComplemento(e.target.value)} maxLength={45} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  {/* Bairro */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bairro *</label>
                    <input type="text" required value={bairro} onChange={(e) => setBairro(e.target.value)} maxLength={45} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  {/* Cidade (Dropdown) */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cidade *</label>
                    <select required value={cidadeId} onChange={(e) => setCidadeId(Number(e.target.value))} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="" disabled>Selecione uma cidade...</option>
                      {cidades.map(c => (
                        <option key={c.idcidade} value={c.idcidade}>{c.nome} - {c.estado}</option>
                      ))}
                    </select>
                  </div>
                  {/* Salário */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Salário</label>
                    <input type="number" step="0.01" value={salario} onChange={(e) => setSalario(e.target.value ? Number(e.target.value) : "")} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  {/* Ativo */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status *</label>
                    <select required value={ativo} onChange={(e) => setAtivo(Number(e.target.value))} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value={1}>Ativo</option>
                      <option value={0}>Inativo</option>
                    </select>
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
