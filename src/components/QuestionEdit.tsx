import { createEffect, createSignal, For, onMount } from "solid-js";
import type { Component } from "solid-js";

const QuestionEdit: Component<{
  setNewQuestion: (value: boolean) => void;
  dbquestions: () => any;
  selectQuestion: (value: any) => void;
  questionSpotlight: () => any;
}> = (props) => {
  const [modelOptions, modelOptionsSet] = createSignal([
    "chatgpt",
    "codeium",
    "claude",
    "llama",
    "piai",
    "mistral",
    "deepseek",
    "cohere",
  ]);
  const [currentAnswers, currentAnswersSet] = createSignal<any[]>([]);

  createEffect(() => {
    if (props.questionSpotlight().answer_type !== "") {
      handleModelLimitations();
    }
  });

  const handleModelLimitations = () => {
    // Check for any existing answers and remove those models from the modelOptions list
    const existingModels = [
      ...Object.keys(props.questionSpotlight().answer_info),
    ];
    modelOptionsSet((prev: any) =>
      prev.filter((model: any) => !existingModels.includes(model))
    );
    console.log("new model options: ", modelOptions());
  };

  const addCurrentAnswers = () => {
    const tempAnswers = Object.values(props.questionSpotlight().answers);
    currentAnswersSet(tempAnswers);
  };

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
      <label for="ai-models">Unmodified Models:</label>
      <select name="ai-models" id="ai-models">
        <For each={modelOptions()}>
          {(model: any) => <option value={model}>{model}</option>}
        </For>
      </select>
      <label for="answer_type">Answer Type:</label>
      <h4>{props.questionSpotlight().answer_type}</h4>
      <div>
        <h3>Question: </h3>
        <h4>{props.questionSpotlight().question}</h4>
      </div>
      <div id="add-answers">
        <input
          type="text"
          id="add-response-1"
          name="add-response-1"
          placeholder="Answer 1"
        />
        <input
          type="text"
          id="add-response-2"
          name="add-response-2"
          placeholder="Answer 2"
        />
        <input
          type="text"
          id="add-response-3"
          name="add-response-3"
          placeholder="Answer 3"
        />
      </div>
    </>
  );
};

export default QuestionEdit;
