import React, { useRef, useMemo } from "react";
import { Route, Routes } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Home from "./core/Home";
import Users from "./user/Users.jsx";
import Register from "./user/Register.jsx";
import Login from './lib/Login.jsx'
import Profile from "./user/Profile.jsx";
import PrivateRoute from "./lib/PrivateRoute.jsx";
import EditProfile from "./user/EditProfile.jsx";
import Games from "./game/games.jsx";
import AddGame from "./game/addGame.jsx";
import GameDetails from "./game/gameDetails.jsx";
import Favorites from "./game/Favorites.jsx";

import Menu from "./core/Menu";

const Particles = () => {
  const particlesRef = useRef();
  const particleCount = 1500;

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      
      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.3 + 0.5, 0.7, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    return [positions, colors];
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const GradientBackground = () => {
  return (
    <mesh position={[0, 0, -20]}>
      <planeGeometry args={[100, 100]} />
      <shaderMaterial
        uniforms={{
          color1: { value: new THREE.Color("#1a1a2e") },
          color2: { value: new THREE.Color("#0f3460") },
          color3: { value: new THREE.Color("#16213e") },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 color1;
          uniform vec3 color2;
          uniform vec3 color3;
          varying vec2 vUv;
          
          void main() {
            vec3 color = mix(color1, color2, vUv.y);
            color = mix(color, color3, vUv.x * 0.5);
            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
};

function MainRouter() {
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <Canvas 
          camera={{ position: [0, 0, 15], fov: 75 }} 
          style={{ width: '100%', height: '100%', display: 'block' }}
          gl={{ alpha: true, antialias: true }}
        >
          <GradientBackground />
          <Particles />
        </Canvas>
      </div>
      <div style={{ minHeight: '100vh', width: '100%', position: 'relative', zIndex: 1 }}>
         <Menu />
      
      <Routes>
         <Route path="/" element={<Home />} />
         <Route path="/users" element={<Users />} />
         <Route path="/games" element={<Games />} />
         <Route path="/games/new" element={<AddGame />} />
         <Route path="/game/:gameId" element={<GameDetails />} />
         <Route path="/register" element={<Register />} />
         <Route path="/login" element={<Login />} />
        
        <Route
          path="/favorites"
          element={
            <PrivateRoute>
              <Favorites />
            </PrivateRoute>
          }
        />
        <Route
          path="/user/edit/:userId"
          element={
            <PrivateRoute>
               <EditProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/user/:userId"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
    </>
  );
}

export default MainRouter;
