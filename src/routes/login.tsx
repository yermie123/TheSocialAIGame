import { createSignal } from "solid-js";
import type { Component } from "solid-js";
import { Title } from "@solidjs/meta";
import pb from "~/lib/pb";

const Login: Component = () => {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");

  const handleLogin = async (email: string, password: string) => {
    try {
      await pb
        .collection("socialAIGameUsers")
        .authWithPassword(email, password);
      history.back();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main>
      <Title>Login</Title>
      <h1>Login</h1>
      <input
        type="email"
        placeholder="Email"
        value={email()}
        onInput={(e) => setEmail(e.currentTarget.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password()}
        onInput={(e) => setPassword(e.currentTarget.value)}
      />
      <button onClick={() => handleLogin(email(), password())}>Login</button>
    </main>
  );
};

export default Login;
