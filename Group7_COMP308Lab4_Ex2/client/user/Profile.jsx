import React from "react";
import { useQuery, gql } from "@apollo/client";
import {
  Paper,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteUser from "./DeleteUser";
import auth from "../lib/auth-helper.js";
import { Link, useParams } from "react-router-dom";

const GET_USER= gql`
  query GetUser($userId: ID!) {
    user(userId: $userId) {
      userId
      username
      email
      role
      createdAt
    }
  }
`;

export default function Profile() {
  const authData = auth.isAuthenticated();
  const { userId: routeUserId } = useParams();
  const userId = routeUserId || authData?.user?.userId;
  
  const { loading, error, data } = useQuery(GET_USER, {
    variables: { userId: userId },
    skip: !userId
  });

  const user = data?.user || {};

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
            {authData?.user &&
              authData.user.userId === user.userId && (
                <ListItemSecondaryAction>
                  <Link to={`/user/edit/${user.userId}`} style={{ textDecoration: "none" }}>
                    <IconButton aria-label="Edit" sx={{ color: "#64c8ff" }}>
                      <EditIcon />
                    </IconButton>
                  </Link>
                  <DeleteUser userId={user.userId} />
                </ListItemSecondaryAction>
              )}
          </ListItem>
          <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.2)" }} />
          <ListItem>
            <ListItemText
              primary={user.username || "Loading..."}
              secondary="Username"
              primaryTypographyProps={{ sx: { color: "#e0e0ff" } }}
              secondaryTypographyProps={{ sx: { color: "rgba(255,255,255,0.6)" } }}
            />
          </ListItem>
          <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.2)" }} />
          <ListItem>
            <ListItemText
              primary={user.email || "Loading..."}
              secondary="Email"
              primaryTypographyProps={{ sx: { color: "#e0e0ff" } }}
              secondaryTypographyProps={{ sx: { color: "rgba(255,255,255,0.6)" } }}
            />
          </ListItem>
          <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.2)" }} />
          <ListItem>
            <ListItemText
              primary={user.role || "Loading..."}
              secondary="Role"
              primaryTypographyProps={{ sx: { color: "#e0e0ff", textTransform: "capitalize" } }}
              secondaryTypographyProps={{ sx: { color: "rgba(255,255,255,0.6)" } }}
            />
          </ListItem>
        </List>
      </Paper>

    </Box>
  );
}
