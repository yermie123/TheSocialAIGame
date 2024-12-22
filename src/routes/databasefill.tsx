import { Show, createSignal, onMount, For, Suspense } from "solid-js";
import type { Component } from "solid-js";
import pb from "~/lib/pb";
import { useNavigate } from "@solidjs/router";
import { Title } from "@solidjs/meta";
import "./databasefill.scss";
import { createNewQuestion } from "~/lib/database";

/* Route Guard as a One-page Higher Order Component */
const DatabaseFill: Component = () => {
  const [authenticated, setAuthenticated] = createSignal(false);

  const navigate = useNavigate();
  onMount(() => {
    // Check if local storage has auth data
    let lauth = localStorage.getItem("pocketbase_auth");
    if (!lauth || lauth === "undefined" || lauth === "null" || lauth === "") {
      navigate("/login");
    } else {
      // Check if user is authenticated
      let auth = pb.authStore.isValid;
      if (!auth) {
        navigate("/login");
      } else {
        setAuthenticated(true);
      }
    }
  });

  return (
    <Show
      when={authenticated()}
      fallback={
        <main>
          <Title>Loading</Title>
          <h2>Loading...</h2>
        </main>
      }
    >
      <DatabaseFillInner />
    </Show>
  );
};

const DatabaseFillInner: Component = () => {
  const [dbquestions, dbquestionsSet] = createSignal([]);
  const [newQuestion, setNewQuestion] = createSignal(false);
  const [queryResult, setQueryResult] = createSignal("unknown");

  onMount(() => {
    console.log("inner mounted");
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

  return (
    <main>
      <Title>Database Fill</Title>
      <div>
        <h3>List of Questions and their ID's</h3>
        <For each={dbquestions()}>
          {(question: any) => (
            <div>
              <p>Question ID: {question.id}</p>
              <p>Question: {question.question}</p>
            </div>
          )}
        </For>
      </div>
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
        <h3>Adding Responses to Existing Questions here</h3>
        <button onClick={() => setNewQuestion(true)}>
          Add New Question Instead
        </button>
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
          <h3>Add Responses: </h3>
          <div>
            <label for="question-id">Question ID:</label>
            <textarea id="question-id" name="question-id" />
          </div>
          <div>
            <label for="existing-response-1">New Response 1:</label>
            <input
              type="text"
              id="existing-response-1"
              name="existing-response-1"
            />
            <label for="existing-response-2">New Response 2:</label>
            <input
              type="text"
              id="existing-response-2"
              name="existing-response-2"
            />
            <label for="existing-response-3">New Response 3:</label>
            <input
              type="text"
              id="existing-response-3"
              name="existing-response-3"
            />
          </div>
        </div>
      </Show>
      <Show when={queryResult() === "success" || queryResult() === "error"}>
        <h3>{queryResult()}</h3>
      </Show>
      <button onClick={() => populateDB()}>Populate Database with Data</button>
    </main>
  );
};

export default DatabaseFill;
