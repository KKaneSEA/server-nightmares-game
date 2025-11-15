"use client";

import "./App.css";
import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import Loading from "./Loading";
import Scene from "./Scene";
import Restart from "./Restart";

import {
  Environment,
  KeyboardControls,
  useKeyboardControls,
} from "@react-three/drei";
import {
  Debug,
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
  "wants a side of ketchup",
  "is wondering where their food is",
  "wants to turn the AC on",
  "wants to turn the AC down",
  "wants to speak to the chef",
  "changed their mind about their order",
  "wants gluten-free bread",
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
  } | null>(null);

  const [pendingRequests, setPendingRequests] = useState<
    Array<{ table: number; request: string }>
  >([]);

  const [gameOver, setGameOver] = useState(false);

  const generateRequest = () => {
    const randomTable = Math.floor(Math.random() * 6) + 1;
    const randomRequestType =
      REQUEST_TYPES[Math.floor(Math.random() * REQUEST_TYPES.length)];
    return { table: randomTable, request: randomRequestType };
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setPendingRequests([]);
    const firstRequest = generateRequest();
    setCurrentRequest(firstRequest);
  };

  const handleTableClick = (tableNumber: number) => {
    if (!gameStarted || gameOver) return;

    if (currentRequest && currentRequest.table === tableNumber) {
      // Correct table clicked - clear current request
      if (pendingRequests.length > 0) {
        setCurrentRequest(pendingRequests[0]);
        setPendingRequests((prev) => prev.slice(1));
      } else {
        // CHANGED: Immediately generate new request when completed
        const newRequest = generateRequest();
        setCurrentRequest(newRequest);
      }
    }
  };

  // CHANGED: Request generation interval
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const generateNewRequest = () => {
      const newRequest = generateRequest();

      // CHANGED: Always replace current request
      if (currentRequest !== null) {
        // If there's a current request, move it to pending before replacing
        setPendingRequests((prev) => {
          const updated = [...prev, currentRequest];
          // Check if backlog exceeds 10
          if (updated.length >= 10) {
            setGameOver(true);
            setGameStarted(false);
            setCurrentRequest(null);
            return [];
          }
          return updated;
        });
      }

      // Set the new request as current
      setCurrentRequest(newRequest);
    };

    // CHANGED: Random interval between 1-2 seconds
    const scheduleNext = () => {
      const randomDelay = Math.random() * 1500 + 2500; // 1500-3000ms
      return setTimeout(generateNewRequest, randomDelay);
    };

    const timeoutId = scheduleNext();

    return () => clearTimeout(timeoutId);
  }, [gameStarted, gameOver, currentRequest, pendingRequests]);

  const restartGame = () => {
    setGameOver(false);
    setGameStarted(false);
    setCurrentRequest(null);
    setPendingRequests([]);
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
            <button onClick={startGame} className="gameStart-Button">
              START GAME
            </button>
          </>
        ) : gameStarted && !gameOver ? (
          <>
            <div className="game-Header-P">
              CLICK THE TABLE NUMBER TO HELP THE GUEST
            </div>
            <div className="game-Header-P">
              MISSED TABLES: {pendingRequests.length}/10
            </div>
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
            <Restart restartGame={restartGame} />
          ) : (
            <Canvas
              camera={{
                position: [0, -1, 0],
                fov: 90,
                near: 1,
                far: 100,
              }}
              resize={{ scroll: false }}
            >
              <Suspense fallback={<Loading />}>
                <Scene onTableClick={handleTableClick} />
              </Suspense>
            </Canvas>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

//before

//  "use client";

// import "./App.css";
// import { Suspense } from "react";
// import { Canvas } from "@react-three/fiber";
// import Loading from "./Loading";
// import Scene from "./Scene";
// import Restart from "./Restart";

// import {
//   Environment,
//   KeyboardControls,
//   useKeyboardControls,
// } from "@react-three/drei";
// import {
//   Debug,
//   RigidBody,
//   Physics,
//   CylinderCollider,
//   CuboidCollider,
//   BallCollider,
//   RapierRigidBody,
//   useRapier,
// } from "@react-three/rapier";

// const Home: React.FC = () => {
//   return (
//     <div className="game-Container">
//       <header className="game-Header">
//         <h1 className="game-Header-Title">SERVER NIGHTMARES</h1>
//         <div className="game-Header-P">click on the table or number</div>
//         <div className="game-Requests">Table 2 needs water</div>
//       </header>

//       <div className="threeD-Container">
//         <div className="threeD-Portal">
//           <Canvas
//             camera={{
//               position: [0, -1, 0], // Position camera in front of the scene
//               fov: 90,
//               near: 1,
//               far: 100,
//             }}
//             resize={{ scroll: false }}
//           >
//             <Suspense
//               fallback={
//                 <Loading
//                 // Example props if your Loading component supports them
//                 // position={[1, -2, -2.5] as [number, number, number]}
//                 // scale={[1, 1, 1] as [number, number, number]}
//                 />
//               }
//             >
//               <Scene />
//             </Suspense>
//           </Canvas>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;
