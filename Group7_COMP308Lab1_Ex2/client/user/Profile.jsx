import React, { useState, useEffect } from "react";
import {
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Avatar,
  IconButton,
  Typography,
  Divider,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Rating,
  Button,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import DeleteIcon from "@mui/icons-material/Delete";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import DeleteUser from "./DeleteUser";
import auth from "../lib/auth-helper.js";
import { read, getUserGames, removeGameFromCollection } from "./api-user.js";
import { Link, useParams, useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const { userId } = useParams();

  useEffect(() => {
    const jwt = auth.isAuthenticated();
    if (!jwt || !jwt.token) return;

    const abortController = new AbortController();
    const signal = abortController.signal;

    read({ userId }, { t: jwt.token }, signal).then((data) => {
      if (data && !data.error) {
        setUser(data);
      }
    });

    getUserGames({ userId }, { t: jwt.token }, signal).then((data) => {
      if (data && !data.error) {
        setGames(data);
      }
      setLoadingGames(false);
    });

    return () => abortController.abort();
  }, [userId]);

  const handleRemoveGame = async (gameId) => {
    const jwt = auth.isAuthenticated();
    if (!jwt || !jwt.token) return;
    
    const result = await removeGameFromCollection(
      { userId },
      { t: jwt.token },
      gameId
    );

    if (result && !result.error) {
      setGames(games.filter((game) => game._id !== gameId));
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: "auto" }}>
      <Paper
        elevation={4}
        sx={{
          maxWidth: 600,
          mx: "auto",
          mb: 4,
          p: 3,
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "16px",
        }}
      >
        <Typography variant="h6" sx={{ mt: 3, mb: 2, color: "#e0e0ff" }}>
          Profile
        </Typography>
        <List dense>
          <ListItem>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: "#64c8ff" }}>
                <PersonIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary={user.username}
              sx={{ color: "#e0e0ff" }}
            />
            {auth.isAuthenticated().user &&
              auth.isAuthenticated().user._id === user._id && (
                <ListItemSecondaryAction>
                  <Link to={`/user/edit/${user._id}`}>
                    <IconButton aria-label="Edit" sx={{ color: "#64c8ff" }}>
                      <EditIcon />
                    </IconButton>
                  </Link>
                  <DeleteUser userId={user._id} />
                </ListItemSecondaryAction>
              )}
          </ListItem>
          <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.2)" }} />
          <ListItem>
            <ListItemText
              primary={
                user.created
                  ? `Joined: ${new Date(user.created).toDateString()}`
                  : "Loading..."
              }
              sx={{ color: "#e0e0ff" }}
            />
          </ListItem>
        </List>
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <SportsEsportsIcon sx={{ fontSize: 40, mr: 2, color: "#64c8ff" }} />
            <Typography variant="h5" sx={{ color: "#e0e0ff", fontWeight: 600 }}>
              My Game Collection
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => navigate("/games")}
            sx={{
              bgcolor: "#64c8ff",
              "&:hover": { bgcolor: "#4fa8df" },
            }}
          >
            Browse Games
          </Button>
        </Box>

        {loadingGames ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress sx={{ color: "#64c8ff" }} />
          </Box>
        ) : games.length === 0 ? (
          <Paper
            sx={{
              p: 5,
              textAlign: "center",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "16px",
            }}
          >
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.7)" }}>
              No games in your collection yet. Browse games to add some!
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {games.map((game) => (
              <Grid item xs={12} sm={6} md={4} key={game._id}>
                <Card
                  sx={{
                    height: "100%",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "16px",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 12px 40px rgba(100, 200, 255, 0.3)",
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Typography variant="h6" sx={{ color: "#e0e0ff", fontWeight: 600, flex: 1 }}>
                        {game.title}
                      </Typography>
                      {auth.isAuthenticated().user &&
                        auth.isAuthenticated().user._id === userId && (
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveGame(game._id)}
                            sx={{ color: "#ff6b6b" }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={game.genre}
                        size="small"
                        sx={{ 
                          bgcolor: "rgba(100, 200, 255, 0.3)", 
                          color: "#e0e0ff",
                          mr: 1,
                          mb: 1
                        }}
                      />
                      {game.platform && (
                        <Chip
                          label={game.platform}
                          size="small"
                          sx={{ 
                            bgcolor: "rgba(255, 255, 255, 0.1)", 
                            color: "#e0e0ff",
                            mb: 1
                          }}
                        />
                      )}
                    </Box>

                    {game.rating !== null && game.rating !== undefined && (
                      <Box sx={{ mb: 2 }}>
                        <Rating
                          value={game.rating / 2}
                          precision={0.5}
                          readOnly
                          size="small"
                          sx={{ color: "#ffd700" }}
                        />
                        <Typography variant="body2" sx={{ color: "#e0e0ff", display: "inline", ml: 1 }}>
                          {game.rating}/10
                        </Typography>
                      </Box>
                    )}

                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: "rgba(255,255,255,0.7)",
                        mb: 2,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {game.description || "No description available."}
                    </Typography>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      {game.releaseYear && (
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
                          {game.releaseYear}
                        </Typography>
                      )}
                      <Button
                        size="small"
                        onClick={() => navigate(`/game/${game._id}`)}
                        sx={{ color: "#64c8ff" }}
                      >
                        View Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}
