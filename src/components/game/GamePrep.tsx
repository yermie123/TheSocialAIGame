import { For, createSignal, onMount } from "solid-js";
import type { Component } from "solid-js";

const GamePrep: Component<{
  gameState: () => any;
  gameStateSet: (value: any) => void;
}> = (props) => {
  const processSelection = () => {
    // Check the inputs for team names and players
    let team1Values: { [key: string]: number } = {};
    let team2Values: { [key: string]: number } = {};
    let team1 = document.getElementsByClassName("player-1");
    let team2 = document.getElementsByClassName("player-2");

    for (let i = 0; i < team1.length; i++) {
      team1Values[(team1[i] as HTMLInputElement).value] = 0;
    }

    for (let i = 0; i < team2.length; i++) {
      team2Values[(team1[i] as HTMLInputElement).value] = 0;
    }

    props.gameStateSet({
      ...props.gameState(),
      team1Players: team1Values,
      team2Players: team2Values,
    });

    props.gameStateSet({
      ...props.gameState(),
      state: "playing",
    });

    console.log(props.gameState());
  };

  return (
    <div id="game-prep">
      <h1>Game Prep</h1>
      <h3>Add Team Names and Players Below</h3>
      <div id="teams">
        <div id="team1">
          <h2>Team 1</h2>
          <PlayerInput team={1} />
        </div>
        <div id="team2">
          <h2>Team 2</h2>
          <PlayerInput team={2} />
        </div>
      </div>
      <button class="success" onClick={() => processSelection()}>
        Finalize Selection
      </button>
    </div>
  );
};

const PlayerInput: Component<{
  team: number;
}> = (props) => {
  const [tP, tPSet] = createSignal<any>([]);

  return (
    <>
      <For each={tP()}>
        {(player: any, index: any) => (
          <input
            type="text"
            class={`player-${props.team}`}
            placeholder={`Player ${index() + 1}`}
          />
        )}
      </For>
      <button onClick={() => tPSet([...tP(), ""])}>Add Another Player</button>
    </>
  );
};
export default GamePrep;
