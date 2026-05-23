import { getFornecedores } from "./actions";
import FornecedorClient from "./fornecedor-client";

export const metadata = {
  title: "Fornecedores",
  description: "Gerenciamento de fornecedores",
};

export default async function FornecedoresPage() {
  const fornecedores = await getFornecedores();

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <FornecedorClient initialData={fornecedores} />
    </div>
  );
}
