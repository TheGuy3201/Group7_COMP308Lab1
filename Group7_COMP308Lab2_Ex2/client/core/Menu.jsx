import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import Button from "@mui/material/Button";
import auth from "../lib/auth-helper";
import { Link, useNavigate, useLocation } from "react-router-dom";

const isActive = (location, path) =>
  location.pathname === path ? "#ff4081" : "#ffffff";

export default function Menu() {
  const navigate = useNavigate();
  const location = useLocation();
  const authData = auth.isAuthenticated();

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Game Library Management System
        </Typography>

        <Link to="/">
          <IconButton aria-label="Home" sx={{ color: isActive(location, "/") }}>
            <HomeIcon />
          </IconButton>
        </Link>

        <Link to="/games">
          <Button sx={{ color: isActive(location, "/games") }}>Games</Button>
        </Link>

        <Link to="/users">
          <Button sx={{ color: isActive(location, "/users") }}>Users</Button>
        </Link>

        {!auth.isAuthenticated() && (
          <>
            <Link to="/register">
              <Button sx={{ color: isActive(location, "/register") }}>
                Register
              </Button>
            </Link>
            <Link to="/login">
              <Button sx={{ color: isActive(location, "/login") }}>
                Login
              </Button>
            </Link>
          </>
        )}

        {authData && (
          <>
            <Link to="/games/new">
              <Button sx={{ color: isActive(location, "/games/new") }}>
                Add Game
              </Button>
            </Link>
            <Link to={`/user/${authData?.player?.playerId}`}>
              <Button
                sx={{
                  color: isActive(
                    location,
                    `/user/${authData?.player?.playerId}`
                  ),
                }}
              >
                My Profile
              </Button>
            </Link>
            <Button
              sx={{ color: "#ffffff" }}
              onClick={() => {
                auth.clearJWT(() => navigate("/"));
              }}
            >
              Sign out
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}


