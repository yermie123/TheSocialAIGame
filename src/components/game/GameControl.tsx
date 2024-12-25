import { createSignal, onMount, Show } from "solid-js";
import type { Component } from "solid-js";
import GamePrep from "~/components/game/GamePrep";
import { updateLSBasic } from "~/lib/localstorage";

const GameControl: Component = () => {
  // This is the shared state in the game
  const [gameState, gameStateSet] = createSignal({
    state: "prepping",
    currentQuestion: null,
  });
  const [mountCheck, mountCheckSet] = createSignal(false);

  onMount(() => {
    // Fetch any updates of game state from localstorage
    const gamestate = localStorage.getItem("gamestate");
    if (gamestate) {
      gameStateSet(JSON.parse(gamestate));
    }

    mountCheckSet(true);
  });

  return (
    <div id="game-control">
      <Show when={mountCheck()} fallback={<h1>Loading...</h1>}>
        <GamePrep gameState={gameState} gameStateSet={gameStateSet} />
      </Show>
    </div>
  );
};

export default GameControl;
