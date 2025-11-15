import "./App.css";
import {
  OrbitControls,
  Environment,
  useGLTF,
  useAnimations,
} from "@react-three/drei";
import { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { FC } from "react";
import { Group, Mesh } from "three"; //
import { ThreeEvent } from "@react-three/fiber"; // ADD this import

interface SceneProps {
  setPanCount?: React.Dispatch<React.SetStateAction<number>>;
  onTableClick?: (tableNumber: number) => void; // ADD this prop
}

const Scene: FC<SceneProps> = ({ setPanCount, onTableClick }) => {
  // ADD onTableClick
  const [hovered, setHovered] = useState<boolean>(false);
  const groupRef = useRef<Group>(null);

  const { scene, animations } = useGLTF("/models/restaurantscene.glb");
  const { actions, names } = useAnimations(animations, groupRef);

  // Enable shadows for all meshes in the GLB
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof Mesh) {
        // More TypeScript-friendly
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  // ADD: Floating camera effect
  // useFrame(({ clock, camera }) => {
  //   const elapsed = clock.getElapsedTime();

  //   // Subtle up/down float
  //   camera.position.y += Math.sin(elapsed * 0.03) * 0.032;

  //   // Slight side-to-side drift
  //   camera.position.x += Math.sin(elapsed * 0.3) * 0.001;
  // });

  useEffect(() => {
    const numberAnimations = names.filter((name) => name.includes("Number_"));

    numberAnimations.forEach((animName) => {
      const action = actions[animName];
      if (action) {
        action.reset();
        action.play();
      }
    });

    console.log("Playing animations:", numberAnimations);
  }, [actions, names]);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
  }, [hovered]);

  // ADD: Click handler for the scene
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (!onTableClick) return;

    // Check if clicked object name contains table or number info
    const clickedObject = event.object;
    const objectName = clickedObject.name;

    console.log("Clicked object:", objectName);

    // Extract table number from object name
    // Adjust this logic based on your actual object naming in the GLB
    const tableMatch = objectName.match(/Table_(\d+)|Number_(\d+)/i);
    if (tableMatch) {
      const tableNumber = parseInt(tableMatch[1] || tableMatch[2]);
      onTableClick(tableNumber);
    }
  };

  return (
    <>
      <OrbitControls
        minDistance={12.5}
        maxDistance={20}
        enablePan={false}
        enableRotate={true}
        minAzimuthAngle={-Math.PI / 3}
        maxAzimuthAngle={Math.PI / 3}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 3.5}
        makeDefault
      />

      <Environment preset="night" />

      <directionalLight
        position={[0, 5, 15]}
        intensity={0.05}
        color="orange"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      <directionalLight
        position={[-10, 5, 5]}
        intensity={0.3}
        color="white"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />

      <directionalLight
        position={[0, 5, -15]}
        intensity={3.5}
        color="#cc0000"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <ambientLight intensity={0.05} color="green" />
      <hemisphereLight
        color="#ff4444"
        groundColor="#1a0000"
        intensity={0.5}
        position={[0, 10, 20]}
      />

      <Physics>
        <group ref={groupRef}>
          <primitive
            // castShadow
            // receiveShadow
            object={scene}
            scale={1}
            position={[0, 5.33, 12]}
            onClick={handleClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
          />
        </group>
      </Physics>
    </>
  );
};

export default Scene;

//before

// import "./App.css";
// import {
//   OrbitControls,
//   Environment,
//   useGLTF,
//   useAnimations,
// } from "@react-three/drei";
// import { useState, useEffect, useRef } from "react";
// import { Physics } from "@react-three/rapier";
// import { FC } from "react";
// import { Group } from "three";

// interface SceneProps {
//   setPanCount?: React.Dispatch<React.SetStateAction<number>>;
// }

// const Scene: FC<SceneProps> = ({ setPanCount }) => {
//   const [hovered, setHovered] = useState<boolean>(false);
//   const groupRef = useRef<Group>(null);

//   // Load your GLTF scene
//   const { scene, animations } = useGLTF("/models/restaurantscene.glb");

//   // Setup animations
//   const { actions, names } = useAnimations(animations, groupRef);

//   useEffect(() => {
//     // Play all number animations on load
//     const numberAnimations = names.filter((name) => name.includes("Number_"));

//     numberAnimations.forEach((animName) => {
//       const action = actions[animName];
//       if (action) {
//         action.reset();
//         action.play();
//       }
//     });

//     console.log("Playing animations:", numberAnimations);
//   }, [actions, names]);

//   useEffect(() => {
//     document.body.style.cursor = hovered ? "pointer" : "auto";
//   }, [hovered]);

//   return (
//     <>
//       {/* Camera positioned straight on to restaurant */}
//       <OrbitControls
//         minDistance={12.5}
//         maxDistance={20}
//         // target={[0, 7, 1.5]} // Center of the restaurant scene
//         enablePan={false}
//         enableRotate={true}
//         // Constrain rotation - limit how far user can rotate left/right
//         minAzimuthAngle={-Math.PI / 3} // -60 degrees (can't rotate past left wall)
//         maxAzimuthAngle={Math.PI / 3} // +60 degrees (can't rotate past right wall)
//         // Constrain vertical rotation
//         minPolarAngle={Math.PI / 5} // Can't look too far down
//         maxPolarAngle={Math.PI / 3.5} // Can't look too far up
//         makeDefault
//       />

//       {/* Enhanced lighting setup */}
//       <Environment preset="apartment" />

//       {/* Key light - main illumination from front */}
//       <directionalLight
//         position={[0, 1, 15]}
//         intensity={0.1}
//         castShadow
//         shadow-mapSize-width={2048}
//         shadow-mapSize-height={2048}
//       />

//       {/* Fill light - soften shadows from the side */}
//       <directionalLight position={[-10, 5, 5]} intensity={0.3} />

//       {/* Back light - add depth and separate objects from background */}
//       <directionalLight position={[0, 5, -10]} intensity={0.3} />

//       {/* Ambient light - soft overall illumination */}
//       <ambientLight intensity={0.1} />

//       {/* Hemisphere light - simulate sky and ground reflection */}
//       <hemisphereLight
//         color="#ffffff"
//         groundColor="#b9b9b9"
//         intensity={0.5}
//         position={[0, 10, 0]}
//       />

//       <Physics>
//         <group ref={groupRef}>
//           <primitive object={scene} scale={1} position={[0, 5.33, 12]} />
//         </group>
//       </Physics>
//     </>
//   );
// };

// export default Scene;
