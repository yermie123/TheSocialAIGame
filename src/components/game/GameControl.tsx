import {
  createSignal,
  onMount,
  Show,
  Switch,
  Match,
  createEffect,
} from "solid-js";
import { createStore } from "solid-js/store";
import type { Component } from "solid-js";
import GamePrep from "~/components/game/GamePrep";
import GamePlay from "~/components/game/GamePlay";
import PlayerScore from "~/components/game/PlayerScore";
import { updateLSBasic } from "~/lib/client/localstorage";

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
    players: Map<string, number>;
  } | null;
  team2: {
    teamName: string;
    teamColor: string;
    players: Map<string, number>;
  } | null;
}

const GameControl: Component = () => {
  // This is the shared state in the game
  const [gameState, gameStateSet] = createSignal<GameState>({
    state: "before-start",
    currentQuestion: null,
    team1: null,
    team2: null,
  });
  const [mountCheck, mountCheckSet] = createSignal(false);
  const [question, questionSet] = createSignal({
    question: "Loading...",
    id: "",
    answerType: "top_vote",
    answers: [],
    answerInfo: {},
  });
  const [properListGen, properListGenSet] = createStore<any>([]);
  const [onePointers, onePointersSet] = createStore<any>([]);
  const [socket, setSocket] = createSignal<WebSocket | null>(null);
  const [connectionCode, connectionCodeSet] = createSignal<string>("");
  const [existingConnectionCode, existingConnectionCodeSet] =
    createSignal<string>("");

  onMount(() => {
    // Fetch any updates of game state from localstorage
    const gamestate = localStorage.getItem("gamestate");
    if (gamestate) {
      gameStateSet(JSON.parse(gamestate));
    }

    mountCheckSet(true);

    const ws = new WebSocket("ws://localhost:3000/ws");

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "RECEIVE_CONNECTION_CODE":
          console.log("Received connection code: ", data);
          // Save connection code in localStorage
          updateLSBasic("connectionCode", data.payload);
          connectionCodeSet(data.payload);
          gameStateSet((prev: any) => ({
            ...prev,
            state: "prepping",
          }));
          break;

        case "INFO_UPDATE":
          if (data.payload === 403) {
            alert("Update to database and server cache failed");
          } else {
            console.log("Update to database and server cache successful");
          }
          break;

        case "SYNC_QUESTION":
          processQuestion(data.payload);
          questionSet(data.payload);

          // Set properListGen in order
          let tempList1 = [];
          for (let i = 0; i < data.payload.answers.length; i++) {
            if (data.payload.answers[i].votes > 1)
              tempList1.push({ ...data.payload.answers[i], visible: false });
          }
          tempList1.sort((a, b) => b.votes - a.votes);

          let tempList2 = [];
          for (let i = 0; i < data.payload.answers.length; i++) {
            if (data.payload.answers[i].votes === 1)
              tempList2.push({ ...data.payload.answers[i], visible: false });
          }

          properListGenSet(tempList1);
          onePointersSet(tempList2);
          console.log("Proper list: ", properListGen);

          break;

        case "REVEAL_CARD":
          // Update single card visibility
          console.log("Request to reveal card: ", data.payload.cardName);
          properListGenSet(
            (card) => card.answer === data.payload.cardName,
            "visible",
            true
          );
          onePointersSet(
            (card) => card.answer === data.payload.cardName,
            "visible",
            true
          );
          break;
      }
    };

    setSocket(ws);
  });

  const startGame = (code: string = "n/a") => {
    if (code === "n/a") {
      // Register a role for a new game as presenter
      socket()?.send(
        JSON.stringify({
          type: "REGISTER_ROLE",
          payload: { role: "presenter" },
        })
      );
    } else if (code !== "n/a") {
      // Register a role for an existing game as player
      socket()?.send(
        JSON.stringify({
          type: "REGISTER_ROLE",
          payload: { role: "existing-presenter", code: code },
        })
      );
    }
  };

  const updateTeamsFromState = () => {
    if (!gameState().team1 || !gameState().team2) {
      alert("Please add at least one player to each team");
      return;
    }

    if (connectionCode() === "") {
      alert(
        "Error: Connection Code missing. If this came up, contact the developer, this is a bug."
      );
      return;
    }

    socket()?.send(
      JSON.stringify({
        type: "UPDATE_INFO",
        payload: {
          infoType: "teams",
          info: {
            team1: gameState().team1,
            team2: gameState().team2,
          },
          code: connectionCode(),
        },
      })
    );
  };

  const processQuestion = (questionData: any) => {
    console.log("Question data: ", questionData);
  };

  return (
    <div id="game-control">
      <Show when={mountCheck()} fallback={<h1>Loading...</h1>}>
        <Switch>
          <Match when={gameState().state === "before-start"}>
            <div id="before-start">
              <h3>Would You Like to Play a New Game?</h3>
              <button onClick={() => startGame()}>Start a New Game</button>
              <button onClick={() => startGame(existingConnectionCode())}>
                I have an existing game that was disconnected
              </button>
              <input
                placeholder="Enter An Existing Code if You Have One"
                onInput={(e) =>
                  existingConnectionCodeSet(e.currentTarget.value)
                }
              />
            </div>
          </Match>
          <Match when={gameState().state === "prepping"}>
            <GamePrep
              gameState={gameState}
              gameStateSet={gameStateSet}
              connectionCode={connectionCode}
              updateTeamsFromState={updateTeamsFromState}
            />
          </Match>
          <Match when={gameState().state === "playing"}>
            <GamePlay
              gameState={gameState}
              question={question}
              properListGenSet={properListGenSet}
              properListGen={properListGen}
              onePointers={onePointers}
            />
          </Match>
          <Match when={gameState().state === "score-check"}>
            <PlayerScore gameState={gameState} />
          </Match>
        </Switch>
      </Show>
    </div>
  );
};

export type { GameState };
export default GameControl;
