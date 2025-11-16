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
        position={[0, 50.5, 10] as THREE.Vector3Tuple}
        // position={[0, 0, -5]}
        color="beige"
        fontSize={1}
      >
        LOADING...
      </Text>
    </>
  );
};

export default Loading;
