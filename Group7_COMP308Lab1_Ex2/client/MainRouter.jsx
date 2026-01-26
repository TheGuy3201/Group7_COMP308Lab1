import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./core/Home";
import Users from "./user/Users.jsx";
import Register from "./user/Register.jsx";
import Login from './lib/Login.jsx'
import Profile from "./user/Profile.jsx";
import PrivateRoute from "./lib/PrivateRoute.jsx";
import EditProfile from "./user/EditProfile.jsx";
import Games from "./game/Games.jsx";
import AddGame from "./game/addGame.jsx";
import GameDetails from "./game/gameDetails.jsx";

import Menu from "./core/Menu";
function MainRouter() {
  return (
    <div>
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
          path="/user/edit/:userId"
          element={
            <PrivateRoute>
               <EditProfile />
            </PrivateRoute>
          }
        />
         <Route path="/user/:userId" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default MainRouter;
