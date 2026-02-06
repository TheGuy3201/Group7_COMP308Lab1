import React, { useState, useEffect } from "react";
import {
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Avatar,
  Typography,
  Link,
  Box,
} from "@mui/material";
import ArrowForward from "@mui/icons-material/ArrowForward";
import { motion } from "framer-motion";
import { list } from "./api-user.js";
import { Link as RouterLink } from "react-router-dom";

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    list(signal).then((data) => {
      if (data?.error) {
        console.log(data.error);
      } else {
        setUsers(data);
      }
    });

    return () => abortController.abort();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Paper
        sx={{
          maxWidth: 600,
          mx: "auto",
          mt: 5,
          p: 3,
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          borderRadius: "16px",
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 2, 
            color: "#e0e0ff",
            fontWeight: 600,
          }}
        >
          All Users
        </Typography>
        <List dense>
          {users.map((item, i) => (
            <motion.div
              key={item._id}
              whileHover={{ backgroundColor: "rgba(100, 200, 255, 0.1)" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                component={RouterLink}
                to={`/user/${item._id}`}
                underline="none"
                sx={{ color: "inherit" }}
              >
                <ListItem
                  button
                  sx={{
                    backgroundColor: "transparent",
                    borderRadius: "12px",
                    mb: 1,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(100, 200, 255, 0.15)",
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        backgroundColor: "rgba(100, 200, 255, 0.4)",
                        color: "#fff",
                        fontWeight: 600,
                        border: "2px solid rgba(100, 200, 255, 0.6)",
                      }}
                    >
                      {item.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography sx={{ color: "#fff", fontWeight: 500 }}>
                        {item.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
                        User
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <IconButton
                        edge="end"
                        sx={{
                          color: "#64c8ff",
                          "&:hover": {
                            backgroundColor: "rgba(100, 200, 255, 0.2)",
                          },
                        }}
                      >
                        <ArrowForward />
                      </IconButton>
                    </motion.div>
                  </ListItemSecondaryAction>
                </ListItem>
              </Link>
            </motion.div>
          ))}
        </List>
      </Paper>
    </motion.div>
  );
}
