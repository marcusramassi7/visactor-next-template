import { getSetores } from "./actions";
import SetorClient from "./setor-client";

export const metadata = {
  title: "Setores",
  description: "Gerenciamento de setores",
};

export default async function SetoresPage() {
  const setores = await getSetores();

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <SetorClient initialData={setores} />
    </div>
  );
}
