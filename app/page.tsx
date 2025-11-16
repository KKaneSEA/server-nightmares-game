"use client";

import "./App.css";
import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import Loading from "./Loading";
import Scene from "./Scene";
import Restart from "./Restart";
import useSound from "use-sound";

import {
  Environment,
  KeyboardControls,
  useKeyboardControls,
} from "@react-three/drei";
import {
  RigidBody,
  Physics,
  CylinderCollider,
  CuboidCollider,
  BallCollider,
  RapierRigidBody,
  useRapier,
} from "@react-three/rapier";

const REQUEST_TYPES = [
  "needs more water",
  "needs a new napkin",
  "dropped their utensils",
  "wants to order wine",
  "needs to order dinner",
  "needs to order an appetizer",
  "wants a side of aioli",
  "is wondering where their food is",
  "wants to turn the AC on",
  "wants to turn the AC down",
  "wants to speak to the chef",
  "changed their mind about dinnerr",
  "wants more bread",
  "needs emotional support",
  "spilled their drink all over the menu",
  "is arguing about the bill already",
  "wants you to sing 'Happy Birthday'",
  "needs a photo taken",
  "needs you to fix the WiFi",
  "wants to see the dessert menu",
  "needs directions to the bathroom",
  "wants to split the bill 8 ways",
  "wants to return half of their sandwich",
  "needs a to-go box",
];

const Home: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<{
    table: number;
    request: string;
    timestamp: number;
  } | null>(null);

  const [pendingRequests, setPendingRequests] = useState<
    Array<{ table: number; request: string }>
  >([]);

  const [missedCount, setMissedCount] = useState(0);

  const [gameOver, setGameOver] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [finalGameTime, setFinalGameTime] = useState(0);
  const [highScore, setHighScore] = useState<number>(0);

  //usesound hook
  const [play, { stop }] = useSound("/sounds/restaurantscene.mp3", {
    loop: true,
    volume: 0.5,
  });

  // Load high score from localStorage after mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("serverNightmaresHighScore");
      if (saved) {
        setHighScore(parseInt(saved));
      }
    }
  }, []);

  const generateRequest = () => {
    const randomTable = Math.floor(Math.random() * 6) + 1;
    const randomRequestType =
      REQUEST_TYPES[Math.floor(Math.random() * REQUEST_TYPES.length)];
    return {
      table: randomTable,
      request: randomRequestType,
      timestamp: Date.now(),
    };
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setPendingRequests([]);
    setMissedCount(0);
    setGameStartTime(Date.now());
    setFinalGameTime(0);
    const firstRequest = generateRequest();
    setCurrentRequest(firstRequest);
    play();
  };

  const handleTableClick = (tableNumber: number) => {
    if (!gameStarted || gameOver || !currentRequest) return;

    const now = Date.now();
    const age = now - currentRequest.timestamp;

    // Only process if request is less than 2 seconds old and matches
    if (currentRequest.table === tableNumber && age < 2000) {
      // Correct table clicked in time - clear current request
      if (pendingRequests.length > 0) {
        const nextRequest = { ...pendingRequests[0], timestamp: Date.now() };
        setCurrentRequest(nextRequest);
        setPendingRequests((prev) => prev.slice(1));
      } else {
        // No pending requests - generate new one
        const newRequest = generateRequest();
        setCurrentRequest(newRequest);
      }
    }
  };

  // +++ Effect to check for expired requests
  useEffect(() => {
    if (!gameStarted || gameOver || !currentRequest) return;

    const checkExpiration = () => {
      const now = Date.now();
      const age = now - currentRequest.timestamp;

      // If current request is older than 2 seconds, it's a permanent miss
      if (age >= 2000) {
        // Increment missed count
        setMissedCount((prev) => {
          const newCount = prev + 1;
          // Check if game over
          if (newCount >= 10) {
            // Calculate final time
            const finalTime = gameStartTime ? Date.now() - gameStartTime : 0;
            setFinalGameTime(finalTime);

            // Update high score if current time is better
            if (finalTime > highScore) {
              setHighScore(finalTime);
              if (typeof window !== "undefined") {
                localStorage.setItem(
                  "serverNightmaresHighScore",
                  finalTime.toString()
                );
              }
            }

            setGameOver(true);
            setGameStarted(false);
            setCurrentRequest(null);
            setPendingRequests([]);
            stop();
          }
          return newCount;
        });

        // Move to next request or generate new one
        if (pendingRequests.length > 0) {
          const nextRequest = { ...pendingRequests[0], timestamp: Date.now() };
          setCurrentRequest(nextRequest);
          setPendingRequests((prev) => prev.slice(1));
        } else {
          const newRequest = generateRequest();
          setCurrentRequest(newRequest);
        }
      }
    };

    // Check every 100ms
    const intervalId = setInterval(checkExpiration, 100);

    return () => clearInterval(intervalId);
  }, [gameStarted, gameOver, currentRequest, pendingRequests]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const generateNewRequest = () => {
      const newRequest = generateRequest();

      if (currentRequest !== null) {
        setPendingRequests((prev) => {
          // Just add to pending queue, don't use timestamp here
          const updated = [
            ...prev,
            { table: currentRequest.table, request: currentRequest.request },
          ];
          return updated;
        });
      }

      setCurrentRequest(newRequest);
    };

    const scheduleNext = () => {
      const randomDelay = Math.random() * 1500 + 2500;
      return setTimeout(generateNewRequest, randomDelay);
    };

    // Only schedule if we already have a current request
    // (startGame already creates the first one)
    if (currentRequest) {
      const timeoutId = scheduleNext();
      return () => clearTimeout(timeoutId);
    }
  }, [gameStarted, gameOver, currentRequest, pendingRequests]);

  const restartGame = () => {
    setGameOver(false);
    setGameStarted(false);
    setCurrentRequest(null);
    setPendingRequests([]);
    setMissedCount(0);
    setGameStartTime(null);
    setFinalGameTime(0);
    stop();
  };

  return (
    <div className="game-Container">
      <header className="game-Header">
        <h1 className="game-Header-Title">SERVER NIGHTMARES</h1>
        {!gameStarted && !gameOver ? (
          <>
            <div className="game-Header-P">
              10 UNHAPPY GUESTS AND YOU'RE OUT
            </div>
            <div className="game-Header-P">
              CLICK THE TABLE NUMBER TO HELP THE GUEST
            </div>
            <button onClick={startGame} className="gameStart-Button">
              START GAME
            </button>
          </>
        ) : gameStarted && !gameOver ? (
          <>
            <div className="game-Header-P">MISSED TABLES: {missedCount}/10</div>
            <div className="game-Requests">
              {currentRequest &&
                `Table ${currentRequest.table} ${currentRequest.request}`}
            </div>
          </>
        ) : null}
      </header>

      <div className="threeD-Container">
        <div className="threeD-Portal">
          {gameOver ? (
            <Restart
              restartGame={restartGame}
              currentGameTime={finalGameTime}
              highScore={highScore}
            />
          ) : (
            <Canvas
              camera={{
                position: [0, 50.5, 0],
                fov: 70,
                near: 1,
                far: 100,
              }}
              resize={{ scroll: false }}
            >
              <Suspense fallback={<Loading />}>
                <Scene
                  onTableClick={handleTableClick}
                  currentRequest={currentRequest}
                />
              </Suspense>
            </Canvas>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
