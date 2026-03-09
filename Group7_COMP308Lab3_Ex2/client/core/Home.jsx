import React, { useEffect, useState } from "react";
import { gql, useQuery } from '@apollo/client';
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
import {Canvas} from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";

const GET_GAMES = gql`
  query GetGames {
    games {
      gameId
      title
      genre
      platform
      rating
      description
    }
  }
`;

const Home = () => {
    const { loading, error, data } = useQuery(GET_GAMES);

    const games = data?.games || [];

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

        {error ? (
          <Typography sx={{ p: 3, color: "#ff5555" }}>
            Error loading games: {error.message}
          </Typography>
        ) : loading ? (
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
                key={game.gameId}
                whileHover={{ y: -8 }}
              >
                <Card
                  component={Link}
                  to={`/game/${game.gameId}`}
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

