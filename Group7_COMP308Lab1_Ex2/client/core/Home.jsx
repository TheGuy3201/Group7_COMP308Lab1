import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  IconButton,
  Button,
  Box,
  Typography,
} from "@mui/material";
import TrashIcon from "@mui/icons-material/Delete";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { list } from "../game/api-game";

const Home = () => {
  const [games, setGames] = useState([]); // ✅ NEVER undefined
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    list(abortController.signal).then((data) => {
      if (!data || data.error) {
        console.error(data?.error);
        setGames([]);
      } else {
        setGames(data);
      }
      setLoading(false);
    });

    return () => abortController.abort();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card
        sx={{
          maxWidth: 900,
          margin: "auto",
          mt: 5,
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(20px)",
          borderRadius: "16px",
        }}
      >
        <Typography
          variant="h3"
          sx={{ px: 2.5, pt: 3, pb: 2, color: "#e0e0ff" }}
        >
          Your Games
        </Typography>

        {loading ? (
          <Typography sx={{ p: 3, color: "#ccc" }}>
            Loading games...
          </Typography>
        ) : games.length === 0 ? (
          <Typography sx={{ p: 3, color: "#ccc" }}>
            No games found. Add one to get started.
          </Typography>
        ) : (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              p: 2,
              overflowX: "auto",
            }}
          >
            {games.map((game) => (
              <motion.div
                key={game._id}
                whileHover={{ y: -8 }}
              >
                <Card
                  component={Link}
                  to={`/game/${game._id}`}
                  sx={{
                    minWidth: 260,
                    textDecoration: "none",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ color: "#fff" }}>
                      {game.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#aaa" }}>
                      {game.genre} • {game.platform || "N/A"}
                    </Typography>

                    <IconButton
                      size="small"
                      sx={{ mt: 1 }}
                      disabled
                    >
                      <TrashIcon sx={{ color: "#ff5555" }} />
                    </IconButton>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        )}

        <Box sx={{ p: 2, display: "flex", gap: 2, justifyContent: "center" }}>
          <Button component={Link} to="/games/new" variant="contained">
            Add New Game
          </Button>
          <Button component={Link} to="/games" variant="outlined">
            Display All Games
          </Button>
        </Box>
      </Card>
    </motion.div>
  );
};

export default Home;

