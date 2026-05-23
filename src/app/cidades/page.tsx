import { getCidades } from "./actions";
import CidadeClient from "./cidade-client";

export const metadata = {
  title: "Cidades",
  description: "Gerenciamento de cidades",
};

export default async function CidadesPage() {
  const cidades = await getCidades();

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <CidadeClient initialData={cidades} />
    </div>
  );
}
