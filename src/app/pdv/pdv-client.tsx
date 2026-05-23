"use client";

import { useState, useRef } from "react";
import {
  type ClientePDV,
  type ProdutoPDV,
  type ItemCarrinho,
  createVenda,
} from "./actions";
import {
  ShoppingCart,
  User,
  Search,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  BarChart3,
} from "lucide-react";

const FORMAS_PAGAMENTO = [
  { value: "Dinheiro", label: "Dinheiro", icon: Banknote },
  { value: "Cartão Débito", label: "Cartão Débito", icon: CreditCard },
  { value: "Cartão Crédito", label: "Cartão Crédito", icon: CreditCard },
  { value: "PIX", label: "PIX", icon: Smartphone },
  { value: "Boleto", label: "Boleto", icon: BarChart3 },
];

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PdvClient({
  clientes,
  produtos,
}: {
  clientes: ClientePDV[];
  produtos: ProdutoPDV[];
}) {
  // ─── Cliente ──────────────────────────────────────────────────────────────
  const [clienteSearch, setClienteSearch] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<ClientePDV | null>(null);
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);

  // ─── Produto / Carrinho ───────────────────────────────────────────────────
  const [produtoSearch, setProdutoSearch] = useState("");
  const [showProdutoDropdown, setShowProdutoDropdown] = useState(false);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);

  // ─── Pagamento ────────────────────────────────────────────────────────────
  const [formaPgmt, setFormaPgmt] = useState("");
  const [desconto, setDesconto] = useState<number>(0);

  // ─── Feedback ─────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [vendaConcluidaId, setVendaConcluidaId] = useState<number | null>(null);

  // ─── Refs ─────────────────────────────────────────────────────────────────
  const produtoInputRef = useRef<HTMLInputElement>(null);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const clientesFiltrados = clienteSearch.length >= 1
    ? clientes.filter(
        (c) =>
          c.nome.toLowerCase().includes(clienteSearch.toLowerCase()) ||
          c.idCliente.toString() === clienteSearch ||
          c.cpf.includes(clienteSearch)
      ).slice(0, 8)
    : [];

  const produtosFiltrados = produtoSearch.length >= 1
    ? produtos.filter(
        (p) =>
          p.nome.toLowerCase().includes(produtoSearch.toLowerCase()) ||
          p.idProduto.toString() === produtoSearch
      ).slice(0, 8)
    : [];

  const subtotal = carrinho.reduce((sum, item) => sum + item.totalItem, 0);
  const descontoValido = Math.max(0, Math.min(desconto, subtotal));
  const total = subtotal - descontoValido;

  // ─── Actions ──────────────────────────────────────────────────────────────
  const selecionarCliente = (c: ClientePDV) => {
    setClienteSelecionado(c);
    setClienteSearch("");
    setShowClienteDropdown(false);
    produtoInputRef.current?.focus();
  };

  const adicionarProduto = (p: ProdutoPDV) => {
    setProdutoSearch("");
    setShowProdutoDropdown(false);
    setCarrinho((prev) => {
      const idx = prev.findIndex((i) => i.produto.idProduto === p.idProduto);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantidade: updated[idx].quantidade + 1,
          totalItem: (updated[idx].quantidade + 1) * p.preco,
        };
        return updated;
      }
      return [...prev, { produto: p, quantidade: 1, totalItem: p.preco }];
    });
    produtoInputRef.current?.focus();
  };

  const alterarQuantidade = (idx: number, delta: number) => {
    setCarrinho((prev) => {
      const updated = [...prev];
      const nova = updated[idx].quantidade + delta;
      if (nova <= 0) {
        return updated.filter((_, i) => i !== idx);
      }
      updated[idx] = {
        ...updated[idx],
        quantidade: nova,
        totalItem: nova * updated[idx].produto.preco,
      };
      return updated;
    });
  };

  const removerItem = (idx: number) => {
    setCarrinho((prev) => prev.filter((_, i) => i !== idx));
  };

  const limparVenda = () => {
    setCarrinho([]);
    setClienteSelecionado(null);
    setClienteSearch("");
    setFormaPgmt("");
    setDesconto(0);
    setFeedback(null);
    setVendaConcluidaId(null);
  };

  const finalizarVenda = async () => {
    setFeedback(null);
    if (!clienteSelecionado) {
      setFeedback({ type: "error", msg: "Selecione um cliente para continuar." });
      return;
    }
    if (carrinho.length === 0) {
      setFeedback({ type: "error", msg: "Adicione pelo menos um produto à venda." });
      return;
    }
    if (!formaPgmt) {
      setFeedback({ type: "error", msg: "Selecione a forma de pagamento." });
      return;
    }

    setIsLoading(true);
    const result = await createVenda({
      Cliente_idCliente: clienteSelecionado.idCliente,
      tipo: "SV",
      forma_pgmt: formaPgmt,
      desconto: descontoValido,
      itens: carrinho.map((item) => ({
        Produto_idProduto: item.produto.idProduto,
        quantidade: item.quantidade,
        precoUnit: item.produto.preco,
      })),
    });
    setIsLoading(false);

    if (result.success) {
      setVendaConcluidaId(result.idvenda!);
      setFeedback({ type: "success", msg: `Venda #${result.idvenda} finalizada com sucesso!` });
    } else {
      setFeedback({ type: "error", msg: result.error || "Erro ao finalizar venda." });
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <ShoppingCart size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">PDV — Ponto de Venda</h1>
            <p className="text-xs text-slate-500">{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</p>
          </div>
        </div>
        {vendaConcluidaId && (
          <button onClick={limparVenda} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} />
            Nova Venda
          </button>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`mx-4 mt-3 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium shrink-0 ${
          feedback.type === "success"
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
        }`}>
          {feedback.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="flex-1">{feedback.msg}</span>
          <button onClick={() => setFeedback(null)}><X size={16} /></button>
        </div>
      )}

      {/* Main Grid */}
      <div className="flex flex-1 gap-0 overflow-hidden p-4 gap-4 min-h-0">

        {/* ── Coluna Esquerda: Carrinho ── */}
        <div className="flex flex-col flex-1 min-w-0 gap-4">

          {/* Busca de Produto */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shrink-0">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Buscar Produto
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={produtoInputRef}
                type="text"
                value={produtoSearch}
                onChange={(e) => { setProdutoSearch(e.target.value); setShowProdutoDropdown(true); }}
                onFocus={() => setShowProdutoDropdown(true)}
                onBlur={() => setTimeout(() => setShowProdutoDropdown(false), 150)}
                placeholder="Nome ou código do produto..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              {showProdutoDropdown && produtosFiltrados.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden">
                  {produtosFiltrados.map((p) => (
                    <button
                      key={p.idProduto}
                      onMouseDown={() => adicionarProduto(p)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-left transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0"
                    >
                      <div>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{p.nome}</span>
                        {p.descricao && <span className="block text-xs text-slate-500">{p.descricao}</span>}
                      </div>
                      <span className="text-sm font-bold text-blue-600 shrink-0 ml-4">{formatCurrency(p.preco)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Carrinho */}
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col min-h-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <ShoppingCart size={16} />
                Itens da Venda
                {carrinho.length > 0 && (
                  <span className="ml-auto bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full">
                    {carrinho.length} {carrinho.length === 1 ? "item" : "itens"}
                  </span>
                )}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {carrinho.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 p-8">
                  <ShoppingCart size={48} strokeWidth={1} />
                  <p className="text-sm text-center">Nenhum produto adicionado.<br />Busque um produto acima.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/60">
                    <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                      <th className="px-4 py-2 text-left">Produto</th>
                      <th className="px-4 py-2 text-center w-32">Qtd</th>
                      <th className="px-4 py-2 text-right w-28">Unit.</th>
                      <th className="px-4 py-2 text-right w-28">Total</th>
                      <th className="px-4 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrinho.map((item, idx) => (
                      <tr key={item.produto.idProduto} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.produto.nome}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => alterarQuantidade(idx, -1)}
                              className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-slate-800 dark:text-slate-100">{item.quantidade}</span>
                            <button
                              onClick={() => alterarQuantidade(idx, 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-slate-600 dark:text-slate-400">
                          {formatCurrency(item.produto.preco)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-slate-800 dark:text-slate-100">
                          {formatCurrency(item.totalItem)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removerItem(idx)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Subtotal */}
            {carrinho.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-3 shrink-0">
                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>Subtotal ({carrinho.reduce((s, i) => s + i.quantidade, 0)} itens)</span>
                  <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Coluna Direita: Finalização ── */}
        <div className="w-80 flex flex-col gap-4 shrink-0">

          {/* Cliente */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Cliente *
            </label>
            {clienteSelecionado ? (
              <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                  <User size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{clienteSelecionado.nome}</p>
                  <p className="text-xs text-slate-500">{clienteSelecionado.cpf}</p>
                </div>
                <button
                  onClick={() => setClienteSelecionado(null)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={clienteSearch}
                  onChange={(e) => { setClienteSearch(e.target.value); setShowClienteDropdown(true); }}
                  onFocus={() => setShowClienteDropdown(true)}
                  onBlur={() => setTimeout(() => setShowClienteDropdown(false), 150)}
                  placeholder="Nome, código ou CPF..."
                  className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-slate-100"
                />
                {showClienteDropdown && clientesFiltrados.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden">
                    {clientesFiltrados.map((c) => (
                      <button
                        key={c.idCliente}
                        onMouseDown={() => selecionarCliente(c)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-left transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0"
                      >
                        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                          <User size={12} className="text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{c.nome}</span>
                          <span className="block text-xs text-slate-500">{c.cpf}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Forma de Pagamento */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Forma de Pagamento *
            </label>
            <div className="grid grid-cols-1 gap-2">
              {FORMAS_PAGAMENTO.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormaPgmt(value)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    formaPgmt === value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                  {formaPgmt === value && (
                    <CheckCircle size={14} className="ml-auto text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Resumo */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Resumo
            </label>
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400 shrink-0">Desconto (R$)</span>
              <input
                type="number"
                min={0}
                max={subtotal}
                step="0.01"
                value={desconto || ""}
                onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                className="flex-1 text-right rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex items-center justify-between">
              <span className="text-base font-bold text-slate-800 dark:text-slate-100">Total</span>
              <span className="text-2xl font-bold text-blue-600">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Botão Finalizar */}
          <button
            onClick={finalizarVenda}
            disabled={isLoading || !!vendaConcluidaId}
            className={`w-full py-4 rounded-xl text-base font-bold tracking-wide transition-all shadow-lg ${
              vendaConcluidaId
                ? "bg-green-600 text-white cursor-not-allowed"
                : isLoading
                ? "bg-blue-400 text-white cursor-wait"
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white hover:shadow-xl"
            }`}
          >
            {vendaConcluidaId
              ? `✓ Venda #${vendaConcluidaId} Concluída`
              : isLoading
              ? "Processando..."
              : "Finalizar Venda"}
          </button>

          {vendaConcluidaId && (
            <button
              onClick={limparVenda}
              className="w-full py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              + Nova Venda
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
