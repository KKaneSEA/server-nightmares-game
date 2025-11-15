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
import { Group, Mesh, Vector3 } from "three";
import { ThreeEvent } from "@react-three/fiber";

interface SceneProps {
  setPanCount?: React.Dispatch<React.SetStateAction<number>>;
  onTableClick?: (tableNumber: number) => void;
  currentRequest?: { table: number; request: string } | null;
}

const TABLE_POSITIONS: Record<number, [number, number, number]> = {
  1: [-5.19, 1.91, 1.41],
  2: [-5.19, 6.65, 1.41],
  3: [-5.19, 11.28, 1.41],
  4: [4.44, 11.28, 1.41],
  5: [4.59, 7.56, 1.41],
  6: [5.09, 2.68, 1.41],
};

const Scene: FC<SceneProps> = ({
  setPanCount,
  onTableClick,
  currentRequest,
}) => {
  const [hovered, setHovered] = useState<boolean>(false);
  const groupRef = useRef<Group>(null);

  const waiterRef = useRef<Mesh | null>(null);
  const [waiterQueue, setWaiterQueue] = useState<number[]>([]);
  const [currentTarget, setCurrentTarget] = useState<Vector3 | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  const emptyTablesRef = useRef<Record<number, any>>({});

  const { scene, animations } = useGLTF("/models/restaurantscene.glb");
  const { actions, names } = useAnimations(animations, groupRef);

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // +++ Find and assign the Waiter_Vest mesh directly
        if (child.name === "Waiter_Vest") {
          waiterRef.current = child;
          console.log("Found Waiter_Vest at:", child.position);
        }
      }

      // +++ Find EmptyTable objects and store references to them
      if (child.name.match(/^EmptyTable[1-6]$/)) {
        const tableNumber = parseInt(child.name.replace("EmptyTable", ""));
        emptyTablesRef.current[tableNumber] = child;
        console.log(`Found ${child.name}`);
      }
    });
  }, [scene]);

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

  useFrame(() => {
    if (!waiterRef.current) return;

    // If not moving and there's a queue, start moving to next target
    if (!isMoving && waiterQueue.length > 0) {
      const nextTable = waiterQueue[0];
      const tableObject = emptyTablesRef.current[nextTable];

      if (tableObject && waiterRef.current.parent) {
        // Get table's world position
        const tableWorldPos = new Vector3();
        tableObject.getWorldPosition(tableWorldPos);

        // Get waiter's world position
        const waiterWorldPos = new Vector3();
        waiterRef.current.getWorldPosition(waiterWorldPos);

        // Convert table world position to waiter's parent local space
        const targetLocalPos = waiterRef.current.parent.worldToLocal(
          tableWorldPos.clone()
        );

        // Keep waiter's current Y (height) in local space
        const adjustedTarget = new Vector3(
          targetLocalPos.x,
          waiterRef.current.position.y,
          targetLocalPos.z
        );

        setCurrentTarget(adjustedTarget);
        setIsMoving(true);
      }
    }

    if (isMoving && currentTarget && waiterRef.current) {
      const currentPos = waiterRef.current.position;

      const direction = new Vector3(
        currentTarget.x - currentPos.x,
        0, // No Y movement
        currentTarget.z - currentPos.z
      ).normalize();

      const distance = Math.sqrt(
        Math.pow(currentTarget.x - currentPos.x, 2) +
          Math.pow(currentTarget.z - currentPos.z, 2)
      );
      const speed = 0.19; // Adjust speed as needed

      if (distance < 0.1) {
        // Reached target - only set X and Z
        waiterRef.current.position.x = currentTarget.x;
        waiterRef.current.position.z = currentTarget.z;
        setIsMoving(false);
        setCurrentTarget(null);
        setWaiterQueue((prev) => prev.slice(1)); // Remove completed target
      } else {
        waiterRef.current.position.add(direction.multiplyScalar(speed));
      }
    }
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (!onTableClick) return;

    const clickedObject = event.object;
    const objectName = clickedObject.name;

    console.log("Clicked object:", objectName);

    const tableMatch = objectName.match(/Table_(\d+)|Number_(\d+)/i);
    if (tableMatch) {
      const tableNumber = parseInt(tableMatch[1] || tableMatch[2]);

      // Only add to waiter queue if it matches the current request
      if (currentRequest && currentRequest.table === tableNumber) {
        setWaiterQueue((prev) => [...prev, tableNumber]);
        onTableClick(tableNumber);
      }
    }
  };

  return (
    <>
      <OrbitControls
        minDistance={11.5}
        maxDistance={17}
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
            object={scene}
            scale={1}
            position={[0, 1.2, 2.3]}
            onClick={handleClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
          />
        </group>

        {/* Waiter is already in the scene, no need to add a new mesh */}
      </Physics>
    </>
  );
};

export default Scene;
