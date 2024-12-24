import { Title } from "@solidjs/meta";
import Counter from "~/components/Counter";
import { A } from "@solidjs/router";
import "./index.scss";
import "solid-js/web";

export default function Home() {
  return (
    <main>
      <Title>The Social AI Game</Title>
      <h1>The Social AI Game</h1>
      <h2>Do You Know How Well AI Knows You?</h2>
      <A href="/game">
        <button>Play the Game</button>
      </A>
      <A href="/databasefill">
        <button>Populate Database with Data</button>
      </A>
    </main>
  );
}
