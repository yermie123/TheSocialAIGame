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

  const startNewGame = () => {
    // Register a role for a new game as presenter
    socket()?.send(
      JSON.stringify({
        type: "REGISTER_ROLE",
        payload: { role: "presenter" },
      })
    );

    // Set game state to prepping
    gameStateSet((prev: any) => ({
      ...prev,
      state: "prepping",
    }));
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
              <button onClick={() => startNewGame()}>Start a New Game</button>
              <button>I have an existing game that was disconnected</button>
            </div>
          </Match>
          <Match when={gameState().state === "prepping"}>
            <GamePrep
              gameState={gameState}
              gameStateSet={gameStateSet}
              connectionCode={connectionCode}
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
        </Switch>
      </Show>
    </div>
  );
};

export default GameControl;
