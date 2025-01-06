import { createSignal, Switch, Match } from "solid-js";
import type { Component } from "solid-js";
import { Title } from "@solidjs/meta";
import Rules from "~/components/game/Rules";
import GameControl from "~/components/game/GameControl";
import "./game.scss";

const Game: Component = () => {
  const [gameRoutingState, gameRoutingStateSet] = createSignal("game");

  return (
    <main>
      <Title>Game</Title>
      <div id="mini-nav">
        <p onClick={() => gameRoutingStateSet("game")}>
          <span class="label">Play the Game</span>
        </p>
        <p onClick={() => gameRoutingStateSet("rules")}>
          <span class="label">Rules of the Game</span>
        </p>
        <p onClick={() => gameRoutingStateSet("current-question-details")}>
          <span class="label">Current Question Details</span>
        </p>
      </div>
      <Switch>
        <Match when={gameRoutingState() === "game"}>
          <GameControl />
        </Match>
        <Match when={gameRoutingState() === "rules"}>
          <Rules />
        </Match>
        <Match when={gameRoutingState() === "current-question-details"}>
          <h2>Current Question Details</h2>
        </Match>
      </Switch>
    </main>
  );
};

export default Game;
