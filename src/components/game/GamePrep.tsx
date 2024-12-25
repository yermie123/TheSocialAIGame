import type { Component } from "solid-js";

const GamePrep: Component<{
  gameState: () => any;
  gameStateSet: (value: any) => void;
}> = (props) => {
  return (
    <div id="game-prep">
      <h1>Game Prep</h1>
      <h3>Add Team Names and Players Below</h3>
      <div id="teams">
        <div id="team1">
          <h2>Team 1</h2>
          <PlayerInput
            gameState={props.gameState}
            gameStateSet={props.gameStateSet}
            team={1}
          />
        </div>
        <div id="team2">
          <h2>Team 2</h2>
          <PlayerInput
            gameState={props.gameState}
            gameStateSet={props.gameStateSet}
            team={2}
          />
        </div>
      </div>
    </div>
  );
};

const PlayerInput: Component<{
  gameState: () => any;
  gameStateSet: (value: any) => void;
  team: number;
}> = (props) => {
  return (
    <>
      <input
        type="text"
        name="team1-player1"
        id="team1-player1"
        placeholder="Player 1"
      />
      <button onClick={() => alert("TODO: Add Player Input")}>
        Add Another Player
      </button>
    </>
  );
};
export default GamePrep;
