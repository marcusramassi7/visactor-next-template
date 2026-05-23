import { getClientes } from "./actions";
import { getCidades } from "../cidades/actions";
import ClienteClient from "./cliente-client";

export const metadata = {
  title: "Clientes",
  description: "Gerenciamento de clientes",
};

export default async function ClientesPage() {
  const [clientes, cidades] = await Promise.all([
    getClientes(),
    getCidades()
  ]);

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <ClienteClient initialData={clientes} cidades={cidades} />
    </div>
  );
}
