import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
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
import { Link, useParams, useNavigate } from "react-router-dom";
import AvatarUpload from "./AvatarUpload";

const GET_PLAYER = gql`
  query GetPlayer($playerId: ID!) {
    player(playerId: $playerId) {
      playerId
      username
      email
      avatarIMG
      favouriteGames {
        gameId
        title
        genre
        platform
        releaseYear
        developer
        rating
        description
      }
    }
  }
`;

const REMOVE_FAV = gql`
  mutation RemoveFavouriteGame($playerId: ID!, $gameId: ID!) {
    removeFavouriteGame(playerId: $playerId, gameId: $gameId) {
      playerId
    }
  }
`;

const UPDATE_AVATAR = gql`
  mutation UpdatePlayerAvatar($playerId: ID!, $avatarIMG: String!) {
    updatePlayer(playerId: $playerId, avatarIMG: $avatarIMG) {
      playerId
      avatarIMG
    }
  }
`;

export default function Profile() {
  const navigate = useNavigate();
  const authData = auth.isAuthenticated();
  const { userId: routeUserId } = useParams();
  const userId = routeUserId || authData?.player?.playerId;
  
  const { loading, error, data } = useQuery(GET_PLAYER, {
    variables: { playerId: userId },
    skip: !userId
  });

  const user = data?.player || {};
  const games = user.favouriteGames || [];

  const [removeFavouriteGame] = useMutation(REMOVE_FAV, {
  refetchQueries: [
    {
      query: GET_PLAYER,
      variables: { playerId: userId }
    }
  ]
});

const handleRemoveGame = async (gameId) => {
  try {
    await removeFavouriteGame({
      variables: {
        playerId: userId,
        gameId
      }
    });
  } catch (err) {
    console.log(err);
  }
};

  const [updateAvatar] = useMutation(UPDATE_AVATAR);

  const handleAvatarUpload = async (avatarURL) => {
  try {
    await updateAvatar({
      variables: {
        playerId: user.playerId,
        avatarIMG: avatarURL,
      },
    });
  } catch (err) {
    console.error(err);
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
              <Avatar
                src={user.avatarIMG}
                sx={{ width: 60, height: 60 }}
              >
              <PersonIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary={user.username}
              sx={{ color: "#e0e0ff" }}
            />
            {authData?.player &&
              authData.player.playerId === user.playerId && (
                <ListItemSecondaryAction>
                  <Link to={`/user/edit/${user.playerId}`}>
                    <IconButton aria-label="Edit" sx={{ color: "#64c8ff" }}>
                      <EditIcon />
                    </IconButton>
                  </Link>
                  <DeleteUser userId={user.playerId} />
                </ListItemSecondaryAction>
              )}
          </ListItem>
          {authData?.player &&
 authData.player.playerId === user.playerId && (
   <AvatarUpload onUploadSuccess={handleAvatarUpload} />
)}
          <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.2)" }} />
          <ListItem>
            <ListItemText
              primary={user.email || "Loading..."}
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

        {loading ? (
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
              <Grid item xs={12} sm={6} md={4} key={game.gameId}>
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
                      {authData?.player &&
                        authData.player.playerId === userId && (
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveGame(game.gameId)}
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
                        onClick={() => navigate(`/game/${game.gameId}`)}
                        sx={{ color: "#64c8ff" }}
                      >
                        View Details
                      </Button>
                      <IconButton onClick={() => handleRemoveGame(game.gameId)}>
                      <DeleteIcon />
                      </IconButton>
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
