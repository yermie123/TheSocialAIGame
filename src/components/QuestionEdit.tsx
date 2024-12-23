import { createEffect, createSignal, For, onMount, Show, Ref } from "solid-js";
import type { Component } from "solid-js";

const QuestionEdit: Component<{
  setNewQuestion: (value: boolean) => void;
  dbquestions: () => any;
  selectQuestion: (value: any) => void;
  questionSpotlight: () => any;
  editedAnswersSet: (value: any) => void;
  editedAnswers: () => any;
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
      addCurrentAnswers();
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
              <p
                onClick={() => props.selectQuestion(question)}
                class={
                  Object.keys(question.answer_info).length === 8
                    ? "completed"
                    : "uncompleted"
                }
              >
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
        <Show
          when={props.editedAnswers().a !== ""}
          fallback={
            <label for="modal_a" class="button success">
              Add Answer A
            </label>
          }
        >
          <div class="add-answers-containers">
            <p>{props.editedAnswers().a}</p>
            <button>Edit</button>
          </div>
        </Show>
        <Show
          when={props.editedAnswers().b !== ""}
          fallback={
            <label for="modal_b" class="button success">
              Add Answer B
            </label>
          }
        >
          <div class="add-answers-containers">
            <p>{props.editedAnswers().b}</p>
            <button>Edit</button>
          </div>
        </Show>
        <Show
          when={props.editedAnswers().c !== ""}
          fallback={
            <label for="modal_c" class="button success">
              Add Answer C
            </label>
          }
        >
          <div class="add-answers-containers">
            <p>{props.editedAnswers().c}</p>
            <button>Edit</button>
          </div>
        </Show>
      </div>

      <QEModal
        setID="modal_a"
        editedAnswersSet={props.editedAnswersSet}
        currentAnswers={currentAnswers}
      />
      <QEModal
        setID="modal_b"
        editedAnswersSet={props.editedAnswersSet}
        currentAnswers={currentAnswers}
      />
      <QEModal
        setID="modal_c"
        editedAnswersSet={props.editedAnswersSet}
        currentAnswers={currentAnswers}
      />
    </>
  );
};

const QEModal: Component<{
  setID: string;
  editedAnswersSet: (value: any) => void;
  currentAnswers: () => any;
}> = (props) => {
  const theUltimateEditor = (inputVal: string) => {
    if (props.setID === "modal_a") {
      props.editedAnswersSet((prev: any) => ({
        ...prev,
        a: inputVal,
      }));
    } else if (props.setID === "modal_b") {
      props.editedAnswersSet((prev: any) => ({
        ...prev,
        b: inputVal,
      }));
    } else if (props.setID === "modal_c") {
      props.editedAnswersSet((prev: any) => ({
        ...prev,
        c: inputVal,
      }));
    }
  };

  let answerRef: any;

  return (
    <div class="modal">
      <input id={props.setID} type="checkbox" />
      <label for={props.setID} class="overlay"></label>
      <article>
        <header>
          <h3>Modal {props.setID}</h3>
          <label for={props.setID} class="close">
            &times;
          </label>
        </header>
        <section class="content">
          <For each={props.currentAnswers()}>
            {(answer: any) => (
              <button onClick={() => (answerRef.value = answer.answer)}>
                {answer.answer}
              </button>
            )}
          </For>
        </section>
        <input
          ref={answerRef}
          type="text"
          placeholder="Select Above or New Answer Here"
        />
        <footer>
          <label
            for={props.setID}
            class="button success"
            onClick={() => theUltimateEditor(answerRef.value)}
          >
            Confirm
          </label>
        </footer>
      </article>
    </div>
  );
};

export default QuestionEdit;
