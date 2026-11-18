import Navbar from "./components/Navbar/Navbar";
import { IdiomaProvider } from "./context/IdiomaProvider";
import { useDadosDoProjeto } from "./hooks/useDadosDoProjeto";

import Apoio from "./sections/Apoio/Apoio";
import Comunidades from "./sections/Comunidades/Comunidades";
import Contato from "./sections/Contato/Contato";
import Equipe from "./sections/Equipe/Equipe";
import Galeria from "./sections/Galeria/Galeria";
import Hero from "./sections/Hero/Hero";
import Resultados from "./sections/Resultados/Resultados";
import Projeto from "./sections/Projeto/Projeto";

function App() {
  // Os totais de Resultados e Comunidades vêm de src/data/estatisticas.json

  const { dados, carregando } = useDadosDoProjeto();

  return (
    <IdiomaProvider>
      <Navbar />

      <main>
        <Hero />
        <Resultados dados={dados} carregando={carregando} />
        <Projeto />
        <Galeria />
        <Comunidades dados={dados} />
        <Equipe />
        <Contato />
        <Apoio ultimaAtualizacao={dados.ultimaAtualizacao} />
      </main>
    </IdiomaProvider>
  );
}

export default App;
