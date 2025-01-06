import { createSignal, For } from "solid-js";
import type { Component } from "solid-js";
import type { GameState } from "./GameControl";

const PlayerScore: Component<{
  gameState: () => GameState;
}> = (props) => {
  return (
    <div id="player-score">
      <h2>Current Scores: </h2>
      <div id="teams">
        <div id="team-1-scores">
          <h3>{props.gameState().team1?.teamName}</h3>
          <For each={Object.entries(props.gameState().team1!.players)}>
            {(playerArr) => (
              <h3>
                {playerArr[0]}: {playerArr[1]}
              </h3>
            )}
          </For>
        </div>
        <div id="team-2-scores">
          <h3>{props.gameState().team2?.teamName}</h3>
          <For each={Object.entries(props.gameState().team2!.players)}>
            {(playerArr) => (
              <h3>
                {playerArr[0]}: {playerArr[1]}
              </h3>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

export default PlayerScore;
