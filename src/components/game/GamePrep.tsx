import { For, createSignal, onMount, Show, createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import type { Component } from "solid-js";

const GamePrep: Component<{
  gameState: () => any;
  gameStateSet: (value: any) => void;
}> = (props) => {
  const [team1Values, team1ValuesSet] = createStore<any>([]);
  const [team2Values, team2ValuesSet] = createStore<any>([]);

  createEffect(() => {
    console.log("team1: ", team1Values);
    console.log("team2: ", team2Values);
  });

  return (
    <div id="game-prep">
      <h1>Game Prep</h1>
      <h3>Add Team Names and Players Below</h3>
      <div id="teams">
        <div id="team1">
          <h2>Team 1</h2>
          <PlayerInput
            team={1}
            tVSet={team1ValuesSet}
            tV={team1Values}
            otherTeamSet={team2ValuesSet}
          />
        </div>
        <div id="team2">
          <h2>Team 2</h2>
          <PlayerInput
            team={2}
            tVSet={team2ValuesSet}
            tV={team2Values}
            otherTeamSet={team1ValuesSet}
          />
        </div>
      </div>
      <button class="success" onClick={() => alert("TODO: Finalize")}>
        Finalize Selection
      </button>
    </div>
  );
};

const PlayerInput: Component<{
  team: number;
  tV: any;
  tVSet: any;
  otherTeamSet: any;
}> = (props) => {
  const combineWithSignal = (value: string, index: number) => {
    console.log("Value: ", value);
    props.tVSet([index], value);
    console.log("Signal: ", props.tV);
  };

  const reloadRemove = (index: string) => {
    let tempArr = [...props.tV];
    tempArr.splice(parseInt(index, 10), 1);
    props.tVSet(tempArr);
    console.log("Removed: ", tempArr);
  };

  const playerToOtherTeam = (index: string) => {
    let tempArr = [...props.tV];
    let tempPlayer = tempArr.splice(parseInt(index, 10), 1);
    props.otherTeamSet((prev: any) => [...prev, tempPlayer]);
    props.tVSet(tempArr);
  };

  return (
    <>
      <For each={props.tV}>
        {(player: any, index: any) => (
          <div class="player-input">
            <Show
              when={props.team === 2}
              fallback={
                <img src={"/trash.svg"} onClick={() => reloadRemove(index())} />
              }
            >
              <img
                src={"/arrow-icons/arrow-left.svg"}
                onClick={() => playerToOtherTeam(index())}
              />
            </Show>
            <input
              type="text"
              class={`player-${props.team}`}
              placeholder={`Player ${index() + 1}`}
              onInput={(e) => combineWithSignal(e.currentTarget.value, index())}
              innerText={player !== "" ? player : ""}
            />
            <Show
              when={props.team === 1}
              fallback={
                <img src={"/trash.svg"} onClick={() => reloadRemove(index())} />
              }
            >
              <img
                src={"/arrow-icons/arrow-right.svg"}
                onClick={() => playerToOtherTeam(index())}
              />
            </Show>
          </div>
        )}
      </For>
      <button onClick={() => props.tVSet((prev: any) => [...prev, ""])}>
        Add Another Player
      </button>
    </>
  );
};
export default GamePrep;
