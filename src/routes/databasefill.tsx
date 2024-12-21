import { Show, createSignal, onMount, For, Suspense } from "solid-js";
import type { Component } from "solid-js";
import pb from "~/lib/pb";
import { useNavigate } from "@solidjs/router";
import { Title } from "@solidjs/meta";
import "./databasefill.scss";

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

  onMount(() => {
    console.log("inner mounted");
  });

  return (
    <main>
      <Title>Database Fill</Title>
      <div>
        <h3>List of Questions and their ID's</h3>
        <For each={dbquestions()}>
          {(question) => (
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
            <div>
              <label for="new-question">New Question:</label>
              <input type="text" id="new-question" name="new-question" />
            </div>
            <div>
              <label for="first-responses">New Question Response 1:</label>
              <input type="text" id="first-response-1" name="first-responses" />
              <label for="first-responses">New Question Response 2:</label>
              <input type="text" id="first-response-2" name="first-responses" />
              <label for="first-responses">New Question Response 3:</label>
              <input type="text" id="first-response-3" name="first-responses" />
            </div>
          </>
        }
      >
        <h3>Adding Responses to Existing Questions here</h3>
        <button onClick={() => setNewQuestion(true)}>
          Add New Question Instead
        </button>
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
        <div>
          <h3>Add Responses: </h3>
          <div>
            <label for="question-id">Question ID:</label>
            <input type="text" id="question-id" name="question-id" />
          </div>
          <div>
            <label for="new-responses">New Response 1:</label>
            <input type="text" id="new-responses" name="new-responses" />
            <label for="new-responses">New Response 2:</label>
            <input type="text" id="new-responses" name="new-responses" />
            <label for="new-responses">New Response 3:</label>
            <input type="text" id="new-responses" name="new-responses" />
          </div>
        </div>
      </Show>
      <button>Populate Database with Data</button>
    </main>
  );
};

export default DatabaseFill;
