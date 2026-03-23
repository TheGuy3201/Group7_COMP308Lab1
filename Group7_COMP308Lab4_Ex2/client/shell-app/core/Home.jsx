import React from "react";
import { gql, useQuery } from "@apollo/client";
import {
  Card,
  CardContent,
  Button,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const GET_LEADERBOARD = gql`
  query GetLeaderboardSnapshot($limit: Int) {
    leaderboard(limit: $limit) {
      progressId
      userId
      level
      experiencePoints
      score
      rank
      progress
      achievements
      updatedAt
    }
  }
`;

const toDisplayDate = (isoDate) => {
  if (!isoDate) {
    return "N/A";
  }

  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
};

const Home = () => {
    const { loading, error, data } = useQuery(GET_LEADERBOARD, {
      variables: { limit: 6 },
      pollInterval: 4000,
      fetchPolicy: "network-only",
    });

    const leaderboard = data?.leaderboard || [];

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
          Live Progress Snapshot
        </Typography>

        <Typography sx={{ px: 2.5, pb: 1.5, color: "rgba(224,224,255,0.8)" }}>
          Auto-refreshing every 4 seconds from the Game Progress microservice.
        </Typography>

        {error ? (
          <Typography sx={{ p: 3, color: "#ff5555" }}>
            Error loading progress data: {error.message}
          </Typography>
        ) : loading ? (
          <Typography sx={{ p: 3, color: "#ccc" }}>
            Loading live progress...
          </Typography>
        ) : leaderboard.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <Typography sx={{ color: "#ccc" }}>
              No progress records yet. Open the Progress Hub to create the first player snapshot.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              p: 2,
              overflowX: "auto",
            }}
          >
            {leaderboard.map((entry, index) => (
              <motion.div
                key={entry.progressId}
                whileHover={{ y: -8 }}
              >
                <Card
                  component={Link}
                  to="/progress"
                  sx={{
                    minWidth: 260,
                    textDecoration: "none",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ color: "#fff" }}>
                      #{index + 1} Player
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#8ce8ff", mb: 1 }}>
                      {entry.userId}
                    </Typography>

                    <Chip
                      size="small"
                      label={`Score ${entry.score}`}
                      sx={{ mr: 1, mb: 1, color: "#fff", backgroundColor: "rgba(100, 200, 255, 0.35)" }}
                    />
                    <Chip
                      size="small"
                      label={`Level ${entry.level}`}
                      sx={{ mr: 1, mb: 1, color: "#fff", backgroundColor: "rgba(122, 255, 180, 0.3)" }}
                    />
                    <Chip
                      size="small"
                      label={`XP ${entry.experiencePoints}`}
                      sx={{ mb: 1, color: "#fff", backgroundColor: "rgba(255, 210, 120, 0.28)" }}
                    />

                    <Typography variant="body2" sx={{ color: "#ddd", mt: 0.5 }}>
                      {entry.progress}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#aaa", display: "block", mt: 0.75 }}>
                      Updated: {toDisplayDate(entry.updatedAt)}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        )}

        <Box sx={{ p: 2, display: "flex", gap: 2, justifyContent: "center" }}>
          <Button component={Link} to="/progress" variant="contained">
            Open Progress Hub
          </Button>
          <Button component={Link} to="/users" variant="outlined">
            Manage Users
          </Button>
        </Box>
      </Card>
    </motion.div>
  );
};

export default Home; 

