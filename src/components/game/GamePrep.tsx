import { For, createSignal, onMount, Show, createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import type { Component } from "solid-js";

const GamePrep: Component<{
  gameState: () => any;
  gameStateSet: (value: any) => void;
}> = (props) => {
  const [team1Values, team1ValuesSet] = createStore<any>([]);
  const [team2Values, team2ValuesSet] = createStore<any>([]);
  const [teamNames, teamNamesSet] = createStore<any>({
    team1: "Team 1",
    team2: "Team 2",
  });

  createEffect(() => {
    console.log("team1: ", team1Values);
    console.log("team2: ", team2Values);
    console.log("team names: ", teamNames);
  });

  const handleFinalize = () => {
    // Focus on button
    const finalizeButton = document.querySelector(
      "#finalize-button"
    ) as HTMLButtonElement;
    finalizeButton.focus();

    // Filter out empty values from each team and set them to 0
    const team1: any = {};
    team1Values.forEach((e: any) => {
      if (e !== "") {
        team1[e] = 0;
      }
    });
    const team2: any = {};
    team2Values.forEach((e: any) => {
      if (e !== "") {
        team2[e] = 0;
      }
    });

    props.gameStateSet((prev: any) => ({
      ...prev,
      state: "playing",
      team1: {
        name: teamNames.team1,
        color: "default1",
        players: team1,
      },
      team2: {
        name: teamNames.team2,
        color: "default2",
        players: team2,
      },
    }));
  };

  return (
    <div id="game-prep">
      <h1>Game Prep</h1>
      <h3>Add Team Names and Players Below</h3>
      <h4>Click on the Team Names to Edit them</h4>
      <div id="teams">
        <div id="team1">
          <h2
            contentEditable={true}
            onInput={(e: any) =>
              teamNamesSet((prev: any) => ({
                ...prev,
                team1: e.target.innerText,
              }))
            }
          >
            Team 1
          </h2>
          <label for="team1Color">{teamNames.team1} Color:</label>
          <input
            type="color"
            id="team1Color"
            name="team1Color"
            value="#C3EB78"
          />
          <PlayerInput
            team={1}
            tVSet={team1ValuesSet}
            tV={team1Values}
            otherTeamSet={team2ValuesSet}
          />
        </div>
        <div id="team2">
          <h2
            contentEditable={true}
            onInput={(e: any) =>
              teamNamesSet((prev: any) => ({
                ...prev,
                team2: e.target.innerText,
              }))
            }
          >
            Team 2
          </h2>
          <label for="team2Color">{teamNames.team2} Color:</label>
          <input
            type="color"
            id="team2Color"
            name="team2Color"
            value="#AB92BF"
          />
          <PlayerInput
            team={2}
            tVSet={team2ValuesSet}
            tV={team2Values}
            otherTeamSet={team1ValuesSet}
          />
        </div>
      </div>
      <button
        id="finalize-button"
        class="success"
        onClick={() => handleFinalize()}
      >
        Finalize Selection
      </button>
      <div id="admin">
        <h3>
          Game Host URL: {import.meta.env.VITE_COMMON_URL_SIMPLIFIED}/gameadmin
        </h3>
        <h3>Code: TODO</h3>
      </div>
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
    props.tVSet(index, value);
  };

  const reloadRemove = (index: string) => {
    const idx = parseInt(index, 10);
    props.tVSet((prev: string[]) => prev.filter((_, i) => i !== idx));
  };

  const playerToOtherTeam = (index: string) => {
    const idx = parseInt(index, 10);
    const player = props.tV[idx];
    props.otherTeamSet((prev: string[]) => [...prev, player]);
    props.tVSet((prev: string[]) => prev.filter((_, i) => i !== idx));
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
              onChange={(e) =>
                combineWithSignal(e.currentTarget.value, index())
              }
              value={player}
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
        Add Player
      </button>
    </>
  );
};

export default GamePrep;
