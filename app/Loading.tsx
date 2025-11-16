import "./App.css";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { FC } from "react";

const Loading: FC = () => {
  return (
    <>
      <Text
        anchorX="center"
        anchorY="middle"
        position={[1, -33.5, -35] as THREE.Vector3Tuple}
        // position={[0, 0, -5]}
        color="beige"
        fontSize={12}
      >
        LOADING...
      </Text>
    </>
  );
};

export default Loading;
