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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <SportsEsportsIcon sx={{ fontSize: 40, mr: 2, color: "primary.main" }} />
        <Typography variant="h4" color="primary">
          All Games
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : games.length === 0 ? (
        <Paper elevation={3} sx={{ p: 5, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No games found. Add some games to get started!
          </Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          elevation={3}
          sx={{
            maxHeight: "calc(100vh - 200px)",
            overflow: "auto",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "white" }}
                >
                  Title
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "white" }}
                >
                  Genre
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "white" }}
                >
                  Platform
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "white" }}
                >
                  Release Year
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "white" }}
                >
                  Developer
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "white" }}
                >
                  Rating
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "white" }}
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
                    "&:hover": { bgcolor: "action.hover", cursor: "pointer" },
                    bgcolor: index % 2 === 0 ? "background.default" : "action.hover",
                  }}
                >
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {game.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={game.genre} color="primary" size="small" />
                  </TableCell>
                  <TableCell>
                    {game.platform ? (
                      <Chip label={game.platform} color="secondary" size="small" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {game.releaseYear || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
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
                        />
                        <Typography variant="body2" color="text.secondary">
                          {game.rating}/10
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
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
  );
}
