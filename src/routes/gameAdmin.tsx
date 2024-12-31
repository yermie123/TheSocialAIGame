import {
  createSignal,
  onMount,
  For,
  Show,
  Switch,
  Match,
  createEffect,
} from "solid-js";
import { createStore } from "solid-js/store";
import { Title } from "@solidjs/meta";
import type { Component } from "solid-js";
import { updateLSBasic } from "~/lib/localstorage";

import "./gameAdmin.scss";

const GameAdmin: Component = () => {
  const [socket, setSocket] = createSignal<WebSocket | null>(null);
  const [question, questionSet] = createSignal({
    question: "Loading...",
    id: "",
    answerType: "top_vote",
    answers: [],
    answerInfo: {},
  });
  const [properListGen, properListGenSet] = createStore<any>([]);
  const [onePointers, onePointersSet] = createStore<any>([]);
  const [connectionCode, connectionCodeSet] = createSignal<string>("");
  const [progress, progressSet] = createSignal("pre-approval");

  onMount(() => {
    const ws = new WebSocket("ws://localhost:3000/ws");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "RECEIVE_CONNECTION_CODE") {
        console.log("Received connection code: ", data);

        // If payload is 403, there was an improper connection code
        if (data.payload === "403") {
          alert("Invalid connection code");
        } else {
          // !WARNING: THERE IS NO ADDITION TO LOCAL STORAGE FOR CONNECTION CODES AT THE MOMENT
          connectionCodeSet(data.payload.code);

          // If game has been created, start the game
          if (
            data.payload.currentQuestion !== null &&
            data.payload.currentQuestion !== ""
          ) {
            progressSet("playing");
          } else {
            progressSet("post-approval");
          }
        }
      }

      if (data.type === "SYNC_QUESTION") {
        questionSet(data.payload);

        // Validation Check
        if (
          question().question !== "Loading..." &&
          question().question !== "" &&
          question().id !== ""
        ) {
          progressSet("playing");

          // Set properListGen in order
          let tempList1 = [];
          for (let i = 0; i < data.payload.answers.length; i++) {
            if (data.payload.answers[i].votes > 1)
              tempList1.push({ ...data.payload.answers[i], visible: true });
          }
          tempList1.sort((a, b) => b.votes - a.votes);

          let tempList2 = [];
          for (let i = 0; i < data.payload.answers.length; i++) {
            if (data.payload.answers[i].votes === 1)
              tempList2.push({ ...data.payload.answers[i], visible: true });
          }

          properListGenSet(tempList1);
          onePointersSet(tempList2);
          console.log("Proper list: ", properListGen);
        }
      }
    };

    setSocket(ws);

    // Set up periodic sync
    const syncInterval = setInterval(() => {
      ws.send(JSON.stringify({ type: "REQUEST_SYNC" }));
    }, 30000); // Sync every 30 seconds
  });

  const setCode = (inputCode: string) => {
    socket()?.send(
      JSON.stringify({
        type: "REGISTER_ROLE",
        payload: { role: "viewer", code: connectionCode() },
      })
    );
  };

  const revealCard = (cardName: string) => {
    socket()?.send(
      JSON.stringify({
        type: "REVEAL_CARD",
        payload: { cardName },
      })
    );
  };

  const newQuestion = () => {
    console.log("Sending new question request to server");
    socket()?.send(
      JSON.stringify({
        type: "REQUEST_NEW_QUESTION",
        payload: {
          code: connectionCode(),
        },
      })
    );
  };

  return (
    <main>
      <Title>Game Admin</Title>
      <h1>Game Admin</h1>
      <Switch>
        <Match when={progress() === "pre-approval"}>
          <div id="need-code">
            <h2>Enter Connection Code:</h2>
            <input
              type="text"
              onInput={(e) => connectionCodeSet(e.currentTarget.value)}
            ></input>
            <button onClick={() => setCode(connectionCode())}>Submit</button>
          </div>
        </Match>
        <Match when={progress() === "post-approval"}>
          <div id="waiting">
            <h3>Press Button Below to Generate Question</h3>
            <button onClick={() => newQuestion()}>Generate Question</button>
          </div>
        </Match>
        <Match when={progress() === "playing"}>
          <div
            id="answers"
            style={{ display: "flex", "flex-direction": "row", gap: "10em" }}
          >
            <div
              id="gen-answers"
              style={{
                display: "flex",
                "flex-direction": "column",
                gap: "0.5em",
                "flex-wrap": "wrap",
              }}
            >
              <h3>Proper List</h3>
              <For each={properListGen}>
                {(answer) => (
                  <button onClick={() => revealCard(answer.answer)}>
                    {answer.answer}: {answer.votes}
                  </button>
                )}
              </For>
            </div>
            <div
              id="one-pointers"
              style={{
                display: "flex",
                "flex-direction": "column",
                gap: "0.5em",
                "flex-wrap": "wrap",
              }}
            >
              <h3>One Pointers</h3>
              <For each={onePointers}>
                {(answer) => (
                  <button onClick={() => revealCard(answer.answer)}>
                    {answer.answer}: {answer.votes}
                  </button>
                )}
              </For>
            </div>
          </div>

          <button
            class="error"
            onClick={() =>
              socket()?.send(
                JSON.stringify({
                  type: "REQUEST_NEW_QUESTION", // This should be a JSON object with a type property
                })
              )
            }
          >
            Request New Question
          </button>
        </Match>
      </Switch>
    </main>
  );
};

export default GameAdmin;
