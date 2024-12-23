import { createSignal } from "solid-js";
import type { Component } from "solid-js";

const QuestionNew: Component<{ setNewQuestion: (value: boolean) => void }> = (
  props
) => {
  return (
    <>
      <h3>Adding new Question here</h3>
      <button onClick={() => props.setNewQuestion(false)}>
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
  );
};

export default QuestionNew;
