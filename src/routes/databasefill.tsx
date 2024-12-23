import { Show, createSignal, onMount, For, Suspense } from "solid-js";
import type { Component } from "solid-js";
import pb from "~/lib/pb";
import { useNavigate } from "@solidjs/router";
import { Title } from "@solidjs/meta";
import "./databasefill.scss";
import DatabaseFillInner from "~/components/DatabaseFillInner";

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

export default DatabaseFill;
