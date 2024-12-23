import { For, createSignal, onMount, Show } from "solid-js";
import { createNewQuestion, getAllQuestions } from "~/lib/database";
import type { Component } from "solid-js";
import { Title } from "@solidjs/meta";
import QuestionNew from "./QuestionNew";
import QuestionEdit from "./QuestionEdit";

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
    setQuestionSpotlight(question);
    console.log("Question spotlight: ", questionSpotlight());
  };

  return (
    <main>
      <Title>Database Fill</Title>
      <Show
        when={!newQuestion()}
        fallback={<QuestionNew setNewQuestion={setNewQuestion} />}
      >
        <QuestionEdit
          setNewQuestion={setNewQuestion}
          dbquestions={dbquestions}
          selectQuestion={selectQuestion}
          questionSpotlight={questionSpotlight}
        />
      </Show>
      <Show when={queryResult() === "success" || queryResult() === "error"}>
        <h3>{queryResult()}</h3>
      </Show>
      <button onClick={() => populateDB()}>Populate Database with Data</button>
    </main>
  );
};

export default DatabaseFillInner;
