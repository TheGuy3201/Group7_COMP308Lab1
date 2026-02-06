import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { list } from "./api-game.js";

export default function Games() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    list(signal).then((data) => {
      if (data && data.error) {
        console.log(data.error);
      } else {
        setGames(data || []);
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
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <SportsEsportsIcon sx={{ fontSize: 40, mr: 2, color: "#64c8ff" }} />
          <Typography variant="h4" sx={{ color: "#e0e0ff", fontWeight: 600 }}>
            All Games
          </Typography>
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
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
              borderRadius: "16px",
            }}
          >
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.7)" }}>
              No games found. Add some games to get started!
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
                <TableRow
                  sx={{
                    backgroundColor: "rgba(100, 200, 255, 0.2)",
                  }}
                >
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
                </TableRow>
              </TableHead>
              <TableBody>
                {games.map((game, index) => (
                  <TableRow
                    key={game._id}
                    onClick={() => navigate(`/game/${game._id}`)}
                    sx={{
                      backgroundColor:
                        index % 2 === 0
                          ? "rgba(255, 255, 255, 0.02)"
                          : "rgba(255, 255, 255, 0.05)",
                      "&:hover": {
                        backgroundColor: "rgba(100, 200, 255, 0.15)",
                        cursor: "pointer",
                      },
                      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <TableCell sx={{ color: "#fff" }}>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        {game.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={game.genre}
                        sx={{
                          backgroundColor: "rgba(100, 200, 255, 0.3)",
                          color: "#fff",
                          fontWeight: 600,
                          border: "1px solid rgba(100, 200, 255, 0.5)",
                        }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {game.platform ? (
                        <Chip
                          label={game.platform}
                          sx={{
                            backgroundColor: "rgba(200, 150, 255, 0.3)",
                            color: "#fff",
                            fontWeight: 600,
                            border: "1px solid rgba(200, 150, 255, 0.5)",
                          }}
                          size="small"
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </motion.div>
  );
}
