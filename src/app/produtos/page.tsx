import { getProdutos } from "./actions";
import { getSetores } from "../setores/actions";
import { getFornecedores } from "../fornecedores/actions";
import ProdutoClient from "./produto-client";

export const metadata = {
  title: "Produtos",
  description: "Gerenciamento de produtos",
};

export default async function ProdutosPage() {
  const [produtos, setores, fornecedores] = await Promise.all([
    getProdutos(),
    getSetores(),
    getFornecedores()
  ]);

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <ProdutoClient initialData={produtos} setores={setores} fornecedores={fornecedores} />
    </div>
  );
}
