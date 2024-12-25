import { createSignal, onMount, For } from "solid-js";
import type { Component } from "solid-js";
import { getRandomQuestion } from "~/lib/database";

const GamePlay: Component = () => {
  const [question, questionSet] = createSignal({
    question: "Loading...",
    id: "",
    answerType: "top_vote",
    answers: [],
    answerInfo: {},
  });
  const [properListGen, properListGenSet] = createSignal<any>([]);
  const [onePointers, onePointersSet] = createSignal<any>([]);

  onMount(async () => {
    console.log("Mounted game play");
    await getRandomQuestion().then((result) => {
      questionSet(result);

      // Set properListGen in order
      let tempList1 = [];
      for (let i = 0; i < result.answers.length; i++) {
        if (result.answers[i].votes > 1) tempList1.push(result.answers[i]);
      }
      tempList1.sort((a, b) => b.votes - a.votes);

      let tempList2 = [];
      for (let i = 0; i < result.answers.length; i++) {
        if (result.answers[i].votes === 1) tempList2.push(result.answers[i]);
      }

      properListGenSet(tempList1);
      onePointersSet(tempList2);
      console.log("Proper list: ", properListGen());
    });

    console.log(question());
  });

  return (
    <div id="game-play">
      <h1>Game Play</h1>
      <h2>{question().question}</h2>
      <div id="answers">
        <div id="gen-answers">
          <h3>Proper List</h3>
          <For each={properListGen()}>
            {(answer) => (
              <div class="answer" id={answer.answer}>
                <p>{answer.answer}</p>
                <p>{answer.votes}</p>
              </div>
            )}
          </For>
        </div>
        <div id="one-pointers">
          <h3>One Pointers</h3>
          <For each={onePointers()}>
            {(answer) => (
              <div class="answer" id={answer.answer}>
                <p>{answer.answer}</p>
                <p>{answer.votes}</p>
              </div>
            )}
          </For>
        </div>
      </div>
      <input
        id="answer-input"
        type="text"
        placeholder="test"
        onInput={(e) => {
          document.getElementById(e.target.value)?.classList.remove("answer");
          document.getElementById(e.target.value)?.classList.add("answer-show");
        }}
      />
    </div>
  );
};

export default GamePlay;
