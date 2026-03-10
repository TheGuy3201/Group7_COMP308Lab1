import React from 'react';
import { useQuery, gql } from '@apollo/client';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Person from '@mui/icons-material/Person';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

// Define GraphQL query
const GET_PLAYERS = gql`
  query GetPlayers {
    players {
      playerId
      username
      email
      avatarIMG
    }
  }
`;

export default function Users() {
  // Replace REST API call with GraphQL query
  const { loading, error, data } = useQuery(GET_PLAYERS);
  
  const users = data?.players || [];

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
              key={item.playerId}
              whileHover={{ backgroundColor: "rgba(100, 200, 255, 0.1)" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                component={RouterLink}
                to={`/user/${item.playerId}`}
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
                      {item.username.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography sx={{ color: "#fff", fontWeight: 500 }}>
                        {item.username}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
                        {item.email}
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
