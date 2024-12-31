import { createSignal, onMount, For } from "solid-js";
import { createStore } from "solid-js/store";
import type { Component } from "solid-js";

const GamePlay: Component<{
  gameState: any;
  question: any;
  properListGen: any;
  properListGenSet: any;
  onePointers: any;
}> = (props) => {
  onMount(async () => {
    console.log("Mounted game play");
    console.log("The following is game state: ", props.gameState());
  });

  return (
    <div id="game-play">
      <h1>Game Play</h1>
      <h2>{props.question().question}</h2>
      <div id="answers">
        <div id="gen-answers">
          <h3>Proper List</h3>
          <For each={props.properListGen}>
            {(answer) => (
              <div
                class={answer.visible ? "answer-show" : "answer"}
                id={answer.answer}
              >
                <h2>{answer.answer}</h2>
                <h2>{answer.votes}</h2>
              </div>
            )}
          </For>
        </div>
        <div id="one-pointers">
          <h3>One Pointers</h3>
          <For each={props.onePointers}>
            {(answer) => (
              <div
                class={answer.visible ? "answer-show" : "answer"}
                id={answer.answer}
              >
                <h2>{answer.answer}</h2>
                <h2>{answer.votes}</h2>
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
          props.properListGenSet(2, (a: any) => ({
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
