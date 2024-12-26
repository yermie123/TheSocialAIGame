import { createSignal, onMount, For } from "solid-js";
import { createStore } from "solid-js/store";
import type { Component } from "solid-js";

const GamePlay: Component = () => {
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

  onMount(async () => {
    console.log("Mounted game play");

    const ws = new WebSocket("ws://localhost:3000/ws");

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "REGISTER_ROLE",
          payload: { role: "presenter" },
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "SYNC_QUESTION":
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
          properListGenSet(
            (card) => card.id === data.payload.cardId,
            "visible",
            true
          );
          onePointersSet(
            (card) => card.id === data.payload.cardId,
            "visible",
            true
          );
          break;
      }
    };

    setSocket(ws);
  });

  return (
    <div id="game-play">
      <h1>Game Play</h1>
      <h2>{question().question}</h2>
      <div id="answers">
        <div id="gen-answers">
          <h3>Proper List</h3>
          <For each={properListGen}>
            {(answer) => (
              <div
                class={answer.visible ? "answer-show" : "answer"}
                id={answer.answer}
              >
                <p>{answer.answer}</p>
                <p>{answer.votes}</p>
              </div>
            )}
          </For>
        </div>
        <div id="one-pointers">
          <h3>One Pointers</h3>
          <For each={onePointers}>
            {(answer) => (
              <div
                class={answer.visible ? "answer-show" : "answer"}
                id={answer.answer}
              >
                <p>{answer.answer}</p>
                <p>{answer.votes}</p>
              </div>
            )}
          </For>
        </div>
      </div>
      {/* <input
        id="answer-input"
        type="text"
        placeholder="test"
        onInput={(e) => {
          document.getElementById(e.target.value)?.classList.remove("answer");
          document.getElementById(e.target.value)?.classList.add("answer-show");
        }}
      /> */}
      <button
        onClick={() =>
          properListGenSet(2, (a: any) => ({
            ...a,
            visible: true,
          }))
        }
      >
        Make random visible
      </button>
    </div>
  );
};

export default GamePlay;
