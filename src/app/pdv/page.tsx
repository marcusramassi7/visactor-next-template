import { getClientesPDV, getProdutosPDV } from "./actions";
import PdvClient from "./pdv-client";

export const metadata = {
  title: "PDV — Ponto de Venda",
  description: "Terminal de ponto de venda",
};

export default async function PdvPage() {
  const [clientes, produtos] = await Promise.all([
    getClientesPDV(),
    getProdutosPDV(),
  ]);

  return (
    <div className="w-full h-full overflow-hidden flex flex-col">
      <PdvClient clientes={clientes} produtos={produtos} />
    </div>
  );
}
