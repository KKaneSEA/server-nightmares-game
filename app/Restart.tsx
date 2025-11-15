import "./App.css";

interface RestartProps {
  restartGame: () => void;
  currentGameTime: number;
  highScore: number;
}

// Helper function to format milliseconds to HH:MM:SS
const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export default function Restart({
  restartGame,
  currentGameTime,
  highScore,
}: RestartProps) {
  return (
    <>
      <div className="gameOver-Container">
        <p className="gameOver-Title">GAME OVER!</p>

        <p className="gameOver-Time">
          Your Score: {formatTime(currentGameTime)}
        </p>
        {highScore > 0 && (
          <p className="gameOver-Time">High Score: {formatTime(highScore)}</p>
        )}

        <button className="gameOver-Button" onClick={restartGame}>
          PLAY AGAIN
        </button>
      </div>
    </>
  );
}
