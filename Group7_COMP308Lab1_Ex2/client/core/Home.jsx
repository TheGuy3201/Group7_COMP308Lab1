import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import TrashIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";

const Home = () => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        maxWidth: 900,
        margin: "auto",
        mt: 5,
      }}
    >
      <Typography
        variant="h3"
        sx={{
          px: 2.5,
          pt: 3,
          pb: 2,
          color: theme.custom?.openTitle || theme.palette.primary.main,
        }}
      >
        Your Games
      </Typography>
      
      <Box
        sx={{
          display: "flex",
          gap: 2,
          p: 2,
          overflowX: "auto",
          flexWrap: "nowrap",
          "&::-webkit-scrollbar": {
            height: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,0.2)",
            borderRadius: "4px",
          },
        }}
      >
        {[1, 2, 3, 4, 5].map((item) => (
          <Card
            key={item}
            component={Link}
            to={`/game/${item}`}
            sx={{
              position: "relative",
              minWidth: "280px",
              maxWidth: "280px",
              flex: "0 0 auto",
              transition: "transform 0.2s",
              cursor: "pointer",
              textDecoration: "none",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 4,
              },
            }}
          >
            <IconButton
              aria-label="Delete"
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                bgcolor: "rgba(255,255,255,0.8)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
              }}
            >
              <TrashIcon />
            </IconButton>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Game Title {item}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Genre • Platform • Year
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          p: 2,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Button
          component={Link}
          to="/games/new"
          variant="contained"
          color="primary"
        >
          Add New Game
        </Button>
        <Button
          component={Link}
          to="/games"
          variant="outlined"
          color="primary"
        >
          Display All Games
        </Button>
      </Box>
    </Card>
  );
};

export default Home;
