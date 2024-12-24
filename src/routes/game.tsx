import { createSignal, Switch, Match } from "solid-js";
import type { Component } from "solid-js";
import { Title } from "@solidjs/meta";
import "./game.scss";

const Game: Component = () => {
  const [gameRoutingState, gameRoutingStateSet] = createSignal("rules");

  return (
    <main>
      <Title>Game</Title>
      <div id="mini-nav">
        <p onClick={() => gameRoutingStateSet("game")}>
          <span class="label">Play the Game</span>
        </p>
        <p onClick={() => gameRoutingStateSet("rules")}>
          <span class="label">Rules of the Game</span>
        </p>
        <p onClick={() => gameRoutingStateSet("current-question-details")}>
          <span class="label">Current Question Details</span>
        </p>
      </div>
      <Switch>
        <Match when={gameRoutingState() === "game"}>
          <h1>Game</h1>
        </Match>
        <Match when={gameRoutingState() === "rules"}>
          <h1>Game Rules</h1>
          <p>
            The Social AI Game is very similar to Family Feud. Two teams are
            competing to be the best at answering questions about how much they
            know about how much AI knows about them.
          </p>
          <p>The question presented were asked multiple AI models.</p>
          <p>
            The AI models are: ChatGPT, Claude, Codeium, Llama, Pi AI, DeepSeek,
            Mistral, and Cohere.
          </p>
          <p>
            The top 3 responses of each AI model are used in determining the
            answers, which each response being 1 vote for an answer. During the
            Rapid Round, the top 3 responses are 'weighted', where the top
            response alone is 2 votes.
          </p>
          <h3>How the Game is Played</h3>
          <p>
            At the start of every round, two players from opposing teams are
            faced off against each other. When the question is asked, each
            player is given an opportunity to press a buzzer to answer the
            question. The first player to press the buzzer is first to answer
            the question.
          </p>
          <p>
            If the player who pressed the buzzer answered with an answer that
            was on the board, the second player gets an option to answer. If the
            answer is higher than that of the first player, the team of the
            second player gets to continue the play. If the answer is lower than
            that of the first player (or a tie), the team of the first player
            gets to continue the play.
          </p>
          <p>
            As the play continues, the team gets a chance to answer the question
            one by one, starting with the next player (after the player from the
            face-off).
          </p>
          <p>
            <b>
              NOTE: During this regular play, the players are not allowed to
              converse with each other
            </b>
          </p>
          <p>
            If the team in play manages to get two wrong answers (answers that
            are not on the board), the opposing team has a chance to steal
            (continue the rest of the game, until they make one wrong answer).
          </p>
          <p>
            Also, if for some reason the two players during the face-off fail to
            provide a proper answer, the next two players from the two teams are
            faced off instead. This can theoretically continue until someone is
            able to provide a proper answer.
          </p>
          <h3>Unique Rules to the Social AI Game</h3>
          <p>
            Due to the small pool of responders, the scores are significantly
            lower and outliers (1 point answers) are common. So, to add a small
            twist to the game...if a team guesses a 1 point answer, they get as
            many points as their current top answer. If they don't have any
            answers yet, it's still only 1 point.
          </p>
          <p>
            Also, the game keeps track of player contibutions, in particular the
            MVP and SVP are announced at the end of the game. (Team play is most
            important, but individual contributions are valued as well.)
          </p>
        </Match>
        <Match when={gameRoutingState() === "current-question-details"}>
          <h1>Leaderboard</h1>
        </Match>
      </Switch>
    </main>
  );
};

export default Game;
