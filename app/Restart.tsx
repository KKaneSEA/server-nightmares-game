import "./App.css";

// ADD: TypeScript interface
interface RestartProps {
  restartGame: () => void;
}

export default function Restart({ restartGame }: RestartProps) {
  // CHANGE props to destructured restartGame
  return (
    <>
      <div className="gameOver-Container">
        <p className="gameOver-Title">GAME OVER!</p>
        <button className="gameOver-Button" onClick={restartGame}>
          {" "}
          {/* CHANGE to restartGame */}
          PLAY AGAIN
        </button>
      </div>
    </>
  );
}
