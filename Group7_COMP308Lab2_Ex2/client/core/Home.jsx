import React, { useEffect, useState } from "react";
import { gql, useQuery } from '@apollo/client';
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
import {Canvas} from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";

const GET_LEADERBOARD_SNAPSHOT = gql`
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

const Home = () => {
    const { loading, error, data } = useQuery(GET_LEADERBOARD_SNAPSHOT, {
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
        <Typography
          variant="body2"
          sx={{ px: 2.5, color: "#aaa", mb: 2 }}
        >
          Auto-refreshes every 4 seconds
        </Typography>

        {error ? (
          <Typography sx={{ p: 3, color: "#ff5555" }}>
            Error loading leaderboard: {error.message}
          </Typography>
        ) : loading ? (
          <Typography sx={{ p: 3, color: "#ccc" }}>
            Loading leaderboard...
          </Typography>
        ) : leaderboard.length === 0 ? (
          <Typography sx={{ p: 3, color: "#ccc" }}>
            No progress records found. Start tracking your progress!
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
            {leaderboard.map((entry, index) => (
              <motion.div
                key={entry.progressId}
                whileHover={{ y: -4 }}
              >
                <Card
                  sx={{
                    minWidth: 240,
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderLeft: "3px solid #49dcb1",
                  }}
                >
                  <CardContent>
                    <Typography variant="body2" sx={{ color: "#49dcb1", fontWeight: 600 }}>
                      #{index + 1}
                    </Typography>
                    <Typography variant="h6" sx={{ color: "#fff", mt: 1 }}>
                      Player {entry.userId}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
                      <Chip label={`Score: ${entry.score}`} size="small" sx={{ backgroundColor: "rgba(73, 220, 177, 0.2)" }} />
                      <Chip label={`Level ${entry.level}`} size="small" sx={{ backgroundColor: "rgba(255, 107, 107, 0.2)" }} />
                      <Chip label={`XP: ${entry.experiencePoints}`} size="small" sx={{ backgroundColor: "rgba(100, 150, 255, 0.2)" }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: "#aaa", mt: 2 }}>
                      Status: {entry.progress}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#666", mt: 1, display: "block" }}>
                      Updated: {new Date(entry.updatedAt).toLocaleString()}
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

