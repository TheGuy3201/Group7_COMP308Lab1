import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Rating,
  Button,
  Grid,
  Divider,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CodeIcon from "@mui/icons-material/Code";
import CategoryIcon from "@mui/icons-material/Category";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { read } from "./api-game.js";
import { addGameToCollection } from "../user/api-user.js";
import auth from "../lib/auth-helper.js";

export default function GameDetails() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    read({ gameId }, signal).then((data) => {
      if (data && data.error) {
        console.log(data.error);
      } else {
        setGame(data);
      }
      setLoading(false);
    });

    return () => abortController.abort();
  }, [gameId]);

  const handleAddToCollection = async () => {
    const jwt = auth.isAuthenticated();
    if (!jwt || !jwt.token) {
      setSnackbar({ open: true, message: "Please login to add games to your collection", severity: "warning" });
      return;
    }

    const result = await addGameToCollection(
      { userId: jwt.user._id },
      { t: jwt.token },
      gameId
    );

    if (result && result.error) {
      setSnackbar({ open: true, message: result.error, severity: "error" });
    } else {
      setSnackbar({ open: true, message: "Game added to your collection!", severity: "success" });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!game) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h5" color="error">
          Game not found
        </Typography>
        <Button onClick={() => navigate("/games")} sx={{ mt: 2 }}>
          Back to Games
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          variant="outlined"
        >
          Back
        </Button>
        <Button
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddToCollection}
          variant="contained"
          sx={{
            bgcolor: "#64c8ff",
            "&:hover": { bgcolor: "#4fa8df" },
          }}
        >
          Add to My Collection
        </Button>
      </Box>

      <Card elevation={6} sx={{ overflow: "visible" }}>
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            p: 4,
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <SportsEsportsIcon sx={{ fontSize: 50 }} />
            <Typography variant="h3" sx={{ fontWeight: "bold" }}>
              {game.title}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Chip
              label={game.genre}
              sx={{ bgcolor: "rgba(255,255,255,0.9)", color: "primary.main", fontWeight: "bold" }}
            />
            {game.platform && (
              <Chip
                label={game.platform}
                sx={{ bgcolor: "rgba(255,255,255,0.9)", color: "secondary.main", fontWeight: "bold" }}
              />
            )}
          </Box>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4}>
            {/* Rating Section */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: "100%", bgcolor: "background.default" }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
                  Rating
                </Typography>
                {game.rating !== null && game.rating !== undefined ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
                    <Rating
                      value={game.rating / 2}
                      precision={0.5}
                      readOnly
                      size="large"
                    />
                    <Typography variant="h4" sx={{ fontWeight: "bold", color: "primary.main" }}>
                      {game.rating}/10
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                    Not yet rated
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* Release Info Section */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: "100%", bgcolor: "background.default" }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
                  Release Information
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {game.releaseYear && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <CalendarTodayIcon color="action" />
                      <Typography variant="body1">
                        <strong>Year:</strong> {game.releaseYear}
                      </Typography>
                    </Box>
                  )}
                  {game.developer && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CodeIcon color="action" />
                      <Typography variant="body1">
                        <strong>Developer:</strong> {game.developer}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Description Section */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3, bgcolor: "background.default" }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
                  Description
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" sx={{ lineHeight: 1.8, textAlign: "justify" }}>
                  {game.description || "No description available for this game."}
                </Typography>
              </Paper>
            </Grid>

            {/* Additional Info */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Added: {new Date(game.created).toLocaleDateString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Last Updated: {new Date(game.updated).toLocaleDateString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
  );
}
