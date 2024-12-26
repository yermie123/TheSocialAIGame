import { createSignal, onMount, For } from "solid-js";
import { createStore } from "solid-js/store";
import { Title } from "@solidjs/meta";
import type { Component } from "solid-js";

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

  onMount(() => {
    const ws = new WebSocket("ws://localhost:3000/ws");

    ws.onopen = () => {
      // Register as viewer and request initial sync
      ws.send(
        JSON.stringify({
          type: "REGISTER_ROLE",
          payload: { role: "viewer" },
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "SYNC_QUESTION") {
        questionSet(data.payload);

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
    };

    setSocket(ws);

    // Set up periodic sync
    const syncInterval = setInterval(() => {
      ws.send(JSON.stringify({ type: "REQUEST_SYNC" }));
    }, 30000); // Sync every 30 seconds
  });

  const revealCard = (cardId: string) => {
    socket()?.send(
      JSON.stringify({
        type: "REVEAL_CARD",
        payload: { cardId },
      })
    );
  };

  return (
    <main>
      <Title>Game Admin</Title>
      <h1>Game Admin</h1>
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
              <button>
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
              <button>
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
    </main>
  );
};

export default GameAdmin;
