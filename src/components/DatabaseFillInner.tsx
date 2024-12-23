import { For, createSignal, onMount, Show } from "solid-js";
import { createNewQuestion, getAllQuestions } from "~/lib/database";
import type { Component } from "solid-js";
import { Title } from "@solidjs/meta";

const DatabaseFillInner: Component = () => {
  const [dbquestions, dbquestionsSet] = createSignal([]);
  const [newQuestion, setNewQuestion] = createSignal(false);
  const [queryResult, setQueryResult] = createSignal("unknown");
  const [questionSpotlight, setQuestionSpotlight] = createSignal({
    id: 0,
    question: "Please Select a Question to Edit",
    answers: [],
    answer_type: "",
    answer_info: {},
  });

  onMount(() => {
    // Get all the questions and display them
    getAllQuestions().then((result: any) => {
      dbquestionsSet(result);
      console.log(result);
    });
  });

  const populateDB = async () => {
    // Check if new question or modify existing question
    if (newQuestion()) {
      // Check for empty inputs
      if (
        !(document.getElementById("new-question") as HTMLTextAreaElement)
          .value ||
        !(document.getElementById("new-response-1") as HTMLInputElement)
          .value ||
        !(document.getElementById("new-response-2") as HTMLInputElement)
          .value ||
        !(document.getElementById("new-response-3") as HTMLInputElement).value
      ) {
        alert("Please fill in all inputs");
        return;
      }

      let result = await createNewQuestion(
        (document.getElementById("new-question") as HTMLTextAreaElement).value,
        (document.getElementById("new-answer-type") as HTMLSelectElement)
          .value as "majority_vote" | "top_vote_weighted" | "top_vote",
        {
          voter: (document.getElementById("new-ai-models") as HTMLInputElement)
            .value,
          answers: {
            a: (document.getElementById("new-response-1") as HTMLInputElement)
              .value,
            b: (document.getElementById("new-response-2") as HTMLInputElement)
              .value,
            c: (document.getElementById("new-response-3") as HTMLInputElement)
              .value,
          },
        }
      );

      if (result) {
        setQueryResult("success");
        setTimeout(() => {
          setQueryResult("unknown");
        }, 2000);
      } else {
        setQueryResult("error");
        setTimeout(() => {
          setQueryResult("unknown");
        }, 2000);
      }
    } else if (!newQuestion()) {
      alert("Not implemented to aid existing questions yet");
    }
  };

  const selectQuestion = (question: any) => {
    console.log("Selected question: ", question);
    setQuestionSpotlight(question.question);
  };

  return (
    <main>
      <Title>Database Fill</Title>
      <Show
        when={!newQuestion()}
        fallback={
          <>
            <h3>Adding new Question here</h3>
            <button onClick={() => setNewQuestion(false)}>
              Add Response to Existing Question Instead
            </button>
            <label for="new-ai-models">AI Model:</label>
            <select name="new-ai-models" id="new-ai-models">
              <option value="chatgpt">Chat GPT (GPT-3.5)</option>
              <option value="codeium">Codeium</option>
              <option value="claude">Claude</option>
              <option value="llama">Llama (Meta AI)</option>
              <option value="piai">Pi</option>
              <option value="mistral">Mistral</option>
              <option value="deepseek">DeepSeek</option>
              <option value="cohere">Cohere (Aya?)</option>
            </select>
            <input id="radiodemo" checked type="radio" name="radiodemo" />
            <label for="new-answer-type">Answer Type:</label>
            <select name="new-answer-type" id="new-answer-type">
              <option value="majority_vote">Majority Vote</option>
              <option value="top_vote_weighted">Top Vote Weighted</option>
              <option value="top_vote">Top Vote</option>
            </select>
            <div>
              <label for="new-question">New Question:</label>
              <textarea id="new-question" name="new-question" />
            </div>
            <div>
              <label for="new-response-1">New Question Response 1:</label>
              <input type="text" id="new-response-1" name="new-response-1" />
              <label for="new-response-2">New Question Response 2:</label>
              <input type="text" id="new-response-2" name="new-response-2" />
              <label for="new-response-3">New Question Response 3:</label>
              <input type="text" id="new-response-3" name="new-response-3" />
            </div>
          </>
        }
      >
        <h3>Editing Existing Questions Here</h3>
        <button onClick={() => setNewQuestion(true)}>
          Add New Question Instead
        </button>
        <div id="existing-questions">
          <h3>List of Questions and their ID's</h3>
          <div id="question-list">
            <For each={dbquestions()}>
              {(question: any) => (
                <p onClick={() => selectQuestion(question)}>
                  Question: {question.question}
                </p>
              )}
            </For>
          </div>
        </div>
        <div id="existing-questions" class="modal">
          <input id="modal_1" type="checkbox" />
          <label for="modal_1" class="overlay"></label>
          <article>
            <header>
              <h3>Great offer</h3>
              <label for="modal_1" class="close">
                &times;
              </label>
            </header>
            <section class="content">
              We have a special offer for you. I am sure you will love it!
              However this does look spammy...
            </section>
            <footer>
              <a class="button" href="#">
                See offer
              </a>
              <label for="modal_1" class="button dangerous">
                Cancel
              </label>
            </footer>
          </article>
        </div>
        <label for="ai-models">AI Model:</label>
        <select name="ai-models" id="ai-models">
          <option value="chatgpt">Chat GPT (GPT-3.5)</option>
          <option value="codeium">Codeium</option>
          <option value="claude">Claude</option>
          <option value="llama">Llama (Meta AI)</option>
          <option value="piai">Pi</option>
          <option value="mistral">Mistral</option>
          <option value="deepseek">DeepSeek</option>
          <option value="cohere">Cohere (Aya?)</option>
        </select>
        <label for="answer_type">Answer Type:</label>
        <select name="answer_type" id="answer_type">
          <option value="majority_vote">Majority Vote</option>
          <option value="top_vote_weighted">Top Vote Weighted</option>
          <option value="top_vote">Top Vote</option>
        </select>
        <div>
          <h3>Question: </h3>
          <h4>{questionSpotlight().question}</h4>
        </div>
      </Show>
      <Show when={queryResult() === "success" || queryResult() === "error"}>
        <h3>{queryResult()}</h3>
      </Show>
      <button onClick={() => populateDB()}>Populate Database with Data</button>
    </main>
  );
};

export default DatabaseFillInner;
