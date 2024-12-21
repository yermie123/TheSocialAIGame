import { Title } from "@solidjs/meta";
import Counter from "~/components/Counter";
import { A } from "@solidjs/router";

export default function Home() {
  return (
    <main>
      <Title>The Social AI Game</Title>
      <h1>The Social AI Game is Under Development</h1>
      <A href="/databasefill">
        <button>Populate Database with Data</button>
      </A>
    </main>
  );
}
