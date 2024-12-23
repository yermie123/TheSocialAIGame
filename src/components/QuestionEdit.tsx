import { createSignal, For } from "solid-js";
import type { Component } from "solid-js";

const QuestionEdit: Component<{
  setNewQuestion: (value: boolean) => void;
  dbquestions: () => any;
  selectQuestion: (value: any) => void;
  questionSpotlight: () => any;
}> = (props) => {
  return (
    <>
      <h3>Editing Existing Questions Here</h3>
      <button onClick={() => props.setNewQuestion(true)}>
        Add New Question Instead
      </button>
      <div id="existing-questions">
        <h3>List of Questions and their ID's</h3>
        <div id="question-list">
          <For each={props.dbquestions()}>
            {(question: any) => (
              <p onClick={() => props.selectQuestion(question)}>
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
            We have a special offer for you. I am sure you will love it! However
            this does look spammy...
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
        <h4>{props.questionSpotlight().question}</h4>
      </div>
    </>
  );
};

export default QuestionEdit;
