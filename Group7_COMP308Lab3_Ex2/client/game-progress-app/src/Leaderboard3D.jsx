import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";

function PlayerBar({ position, score, name, rank }) {
  const height = Math.max(score / 10, 0.5);

  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[1, height, 1]} />
        <meshStandardMaterial
          color={rank === 0 ? "gold" : rank === 1 ? "silver" : "#64c8ff"}
        />
      </mesh>

      <Text position={[0, height + 0.6, 0]} fontSize={0.3} color="white">
        {name}
      </Text>

      <Text position={[0, height + 0.2, 0]} fontSize={0.25} color="yellow">
        {score}
      </Text>
    </group>
  );
}

export default function Leaderboard3D({ data }) {
  if (!data || data.length === 0) {
    return <p style={{ color: "white" }}>Waiting for leaderboard...</p>;
  }

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <Canvas camera={{ position: [0, 8, 12], fov: 60 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 10, 5]} intensity={2} />
        <OrbitControls target={[0, 2, 0]} />

        {data.map((player, index) => (
          <PlayerBar
            key={player.progressId}
            position={[index * 2 - (data.length - 1), 0, 0]}
            score={player.score}
            name={player.userId}
            rank={index}
          />
        ))}
      </Canvas>
    </div>
  );
}