import { createSignal, onMount, Show, Switch, Match } from "solid-js";
import type { Component } from "solid-js";
import GamePrep from "~/components/game/GamePrep";
import GamePlay from "~/components/game/GamePlay";
import { updateLSBasic } from "~/lib/localstorage";

interface GameState {
  state: string;
  currentQuestion: {
    question: string;
    id: string;
    answerType: string;
    answers: string[];
    answerInfo: {
      [key: string]: any;
    };
  } | null;
  team1: {
    teamName: string;
    teamColor: string;
    players: {
      [key: string]: number;
    };
  } | null;
  team2: {
    teamName: string;
    teamColor: string;
    players: {
      [key: string]: number;
    };
  } | null;
}

const GameControl: Component = () => {
  // This is the shared state in the game
  const [gameState, gameStateSet] = createSignal<GameState>({
    state: "prepping",
    currentQuestion: null,
    team1: null,
    team2: null,
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
        <Switch>
          <Match when={gameState().state === "prepping"}>
            <GamePrep gameState={gameState} gameStateSet={gameStateSet} />
          </Match>
          <Match when={gameState().state === "playing"}>
            <GamePlay gameState={gameState} />
          </Match>
        </Switch>
      </Show>
    </div>
  );
};

export default GameControl;
