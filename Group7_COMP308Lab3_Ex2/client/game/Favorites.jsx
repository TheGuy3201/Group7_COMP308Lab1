import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Chip,
  Rating,
  CircularProgress,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import auth from "../lib/auth-helper.js";
import "./game.css";

const GET_PLAYER_FAVORITES = gql`
  query GetPlayer($playerId: ID!) {
    player(playerId: $playerId) {
      playerId
      username
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

const ADD_FAVORITE_GAME = gql`
  mutation AddFavouriteGame($playerId: ID!, $gameId: ID!) {
    addFavouriteGame(playerId: $playerId, gameId: $gameId) {
      playerId
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

const REMOVE_FAVORITE_GAME = gql`
  mutation RemoveFavouriteGame($playerId: ID!, $gameId: ID!) {
    removeFavouriteGame(playerId: $playerId, gameId: $gameId) {
      playerId
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

const GET_ALL_GAMES = gql`
  query GetGames {
    games {
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
`;

export default function Favorites() {
  const navigate = useNavigate();
  const authData = auth.isAuthenticated();
  const playerId = authData?.player?.playerId;

  const {
    loading: favoritesLoading,
    error: favoritesError,
    data: favoritesData,
    refetch: refetchFavorites,
  } = useQuery(GET_PLAYER_FAVORITES, {
    variables: { playerId },
    skip: !playerId,
  });

  const { loading: gamesLoading, error: gamesError, data: gamesData } = useQuery(GET_ALL_GAMES);

  const [addFavorite] = useMutation(ADD_FAVORITE_GAME, {
    onCompleted: () => {
      refetchFavorites();
      setSnackbar({ open: true, message: "Added to favorites!", severity: "success" });
    },
  });

  const [removeFavorite] = useMutation(REMOVE_FAVORITE_GAME, {
    onCompleted: () => {
      refetchFavorites();
      setSnackbar({ open: true, message: "Removed from favorites!", severity: "success" });
    },
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const favoriteGameIds = new Set(favoritesData?.player?.favouriteGames?.map((g) => g.gameId) || []);
  const allGames = gamesData?.games || [];
  const favoriteGames = favoritesData?.player?.favouriteGames || [];
  const availableGames = allGames.filter((game) => !favoriteGameIds.has(game.gameId));

  const handleAddToFavorites = (gameId) => {
    addFavorite({ variables: { playerId, gameId } });
    setAddDialogOpen(false);
  };

  const handleRemoveFromFavorites = (gameId) => {
    removeFavorite({ variables: { playerId, gameId } });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!authData) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.7)" }}>
          Please log in to view your favorite games.
        </Typography>
      </Box>
    );
  }

  if (favoritesLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
        <CircularProgress sx={{ color: "#64c8ff" }} />
      </Box>
    );
  }

  if (favoritesError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Error loading favorites: {favoritesError.message}</Alert>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <FavoriteIcon sx={{ fontSize: 40, mr: 2, color: "#ff4081" }} />
            <Typography variant="h4" sx={{ color: "#e0e0ff", fontWeight: 600 }}>
              My Favorite Games
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setAddDialogOpen(true)}
            sx={{
              backgroundColor: "#64c8ff",
              color: "#1a1a2e",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#4eb8ff",
              },
            }}
          >
            Add Game to Favorites
          </Button>
        </Box>

        {favoriteGames.length === 0 ? (
          <Paper
            sx={{
              p: 5,
              textAlign: "center",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
              borderRadius: "16px",
            }}
          >
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.7)" }}>
              No favorite games yet. Add some to get started!
            </Typography>
          </Paper>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: "calc(100vh - 200px)",
              overflow: "auto",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
              borderRadius: "16px",
              "&::-webkit-scrollbar": {
                width: "8px",
                height: "8px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(100, 200, 255, 0.5)",
                borderRadius: "10px",
                "&:hover": {
                  backgroundColor: "rgba(100, 200, 255, 0.8)",
                },
              },
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: "rgba(100, 200, 255, 0.2)" }}>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: "#e0e0ff",
                      backgroundColor: "rgba(100, 200, 255, 0.2)",
                      borderBottom: "1px solid rgba(100, 200, 255, 0.3)",
                    }}
                  >
                    Title
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: "#e0e0ff",
                      backgroundColor: "rgba(100, 200, 255, 0.2)",
                      borderBottom: "1px solid rgba(100, 200, 255, 0.3)",
                    }}
                  >
                    Genre
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: "#e0e0ff",
                      backgroundColor: "rgba(100, 200, 255, 0.2)",
                      borderBottom: "1px solid rgba(100, 200, 255, 0.3)",
                    }}
                  >
                    Platform
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: "#e0e0ff",
                      backgroundColor: "rgba(100, 200, 255, 0.2)",
                      borderBottom: "1px solid rgba(100, 200, 255, 0.3)",
                    }}
                  >
                    Release Year
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: "#e0e0ff",
                      backgroundColor: "rgba(100, 200, 255, 0.2)",
                      borderBottom: "1px solid rgba(100, 200, 255, 0.3)",
                    }}
                  >
                    Developer
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: "#e0e0ff",
                      backgroundColor: "rgba(100, 200, 255, 0.2)",
                      borderBottom: "1px solid rgba(100, 200, 255, 0.3)",
                    }}
                  >
                    Rating
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: "#e0e0ff",
                      backgroundColor: "rgba(100, 200, 255, 0.2)",
                      borderBottom: "1px solid rgba(100, 200, 255, 0.3)",
                    }}
                  >
                    Description
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: "#e0e0ff",
                      backgroundColor: "rgba(100, 200, 255, 0.2)",
                      borderBottom: "1px solid rgba(100, 200, 255, 0.3)",
                      textAlign: "center",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {favoriteGames.map((game) => (
                  <TableRow
                    key={game.gameId}
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(100, 200, 255, 0.1)",
                      },
                      borderBottom: "1px solid rgba(100, 200, 255, 0.1)",
                    }}
                  >
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}
                      >
                        {game.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {game.genre ? (
                        <Chip
                          label={game.genre}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(100, 200, 255, 0.3)",
                            color: "#fff",
                            fontWeight: 600,
                            border: "1px solid rgba(100, 200, 255, 0.5)",
                          }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {game.platform ? (
                        <Chip
                          label={game.platform}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(100, 200, 255, 0.3)",
                            color: "#fff",
                            fontWeight: 600,
                            border: "1px solid rgba(100, 200, 255, 0.5)",
                          }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                        {game.releaseYear || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                        {game.developer || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {game.rating !== null && game.rating !== undefined ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Rating
                            value={game.rating / 2}
                            precision={0.5}
                            readOnly
                            size="small"
                            sx={{
                              "& .MuiRating-iconFilled": {
                                color: "#ffc107",
                              },
                              "& .MuiRating-iconEmpty": {
                                color: "rgba(255, 193, 7, 0.3)",
                              },
                            }}
                          />
                          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
                            {game.rating}/10
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
                          Not rated
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 300,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color: "rgba(255,255,255,0.7)",
                        }}
                        title={game.description}
                      >
                        {game.description || "No description available"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <Tooltip title="Remove from Favorites">
                        <IconButton
                          onClick={() => handleRemoveFromFavorites(game.gameId)}
                          sx={{
                            color: "#ff4081",
                            "&:hover": {
                              backgroundColor: "rgba(255, 64, 129, 0.2)",
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: "rgba(26, 26, 46, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            },
          }}
        >
          <DialogTitle sx={{ color: "#e0e0ff", fontWeight: 600 }}>
            Add Game to Favorites
          </DialogTitle>
          <DialogContent>
            {gamesLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress sx={{ color: "#64c8ff" }} />
              </Box>
            ) : availableGames.length === 0 ? (
              <Typography sx={{ color: "rgba(255,255,255,0.7)", py: 2 }}>
                All games are already in your favorites!
              </Typography>
            ) : (
              <Box sx={{ maxHeight: "400px", overflow: "auto", py: 2 }}>
                {availableGames.map((game) => (
                  <Paper
                    key={game.gameId}
                    onClick={() => handleAddToFavorites(game.gameId)}
                    sx={{
                      p: 2,
                      mb: 1,
                      backgroundColor: "rgba(100, 200, 255, 0.1)",
                      border: "1px solid rgba(100, 200, 255, 0.3)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "rgba(100, 200, 255, 0.2)",
                        border: "1px solid rgba(100, 200, 255, 0.6)",
                        transform: "translateX(5px)",
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#e0e0ff", fontWeight: 500 }}>
                      {game.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
                      {game.genre} • {game.releaseYear}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddDialogOpen(false)} sx={{ color: "#64c8ff" }}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </motion.div>
  );
}
