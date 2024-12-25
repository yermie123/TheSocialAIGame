import type { Component } from "solid-js";

const GamePrep: Component<{
  gameState: () => any;
  gameStateSet: (value: any) => void;
}> = (props) => {
  return (
    <div id="game-prep">
      <h1>Game Prep</h1>
    </div>
  );
};

export default GamePrep;
