import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import Button from "@mui/material/Button";
import auth from "../lib/auth-helper";
import { Link, useLocation } from "react-router-dom";

const isActive = (location, path) =>
  location.pathname === path ? "#ff4081" : "#ffffff";

export default function Menu() {
  const location = useLocation();
  const authData = auth.isAuthenticated();

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Game Progress Tracker
        </Typography>

        <Link to="/">
          <IconButton aria-label="Home" sx={{ color: isActive(location, "/") }}>
            <HomeIcon />
          </IconButton>
        </Link>

        <Link to="/progress">
          <Button sx={{ color: isActive(location, "/progress") }}>Progress Hub</Button>
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
            <Link to="/progress">
              <Button sx={{ color: isActive(location, "/progress") }}>
                My Progress
              </Button>
            </Link>
            <Link to={`/user/${authData?.user?.userId}`}>
              <Button
                sx={{
                  color: isActive(
                    location,
                    `/user/${authData?.user?.userId}`
                  ),
                }}
              >
                My Profile
              </Button>
            </Link>
            <Link to="/logout">
              <Button sx={{ color: isActive(location, "/logout") }}>Sign out</Button>
            </Link>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}


