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
import { motion } from "framer-motion";

const Home = () => {
  const theme = useTheme();

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
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          borderRadius: "16px",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            px: 2.5,
            pt: 3,
            pb: 2,
            color: "#e0e0ff",
            fontWeight: 600,
            letterSpacing: "0.5px",
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
          {[1, 2, 3, 4, 5].map((item) => (
            <motion.div
              key={item}
              whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(100, 200, 255, 0.4)" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card
                component={Link}
                to={`/game/${item}`}
                sx={{
                  position: "relative",
                  minWidth: "280px",
                  maxWidth: "280px",
                  flex: "0 0 auto",
                  cursor: "pointer",
                  textDecoration: "none",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(15px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "14px",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                  },
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%",
                    pb: 1,
                  }}
                >
                  <div>
                    <Typography variant="h6" gutterBottom sx={{ color: "#fff", mb: 1 }}>
                      Game Title {item}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
                      Genre • Platform • Year
                    </Typography>
                  </div>
                  <IconButton
                    aria-label="Delete"
                    size="small"
                    sx={{
                      alignSelf: "flex-end",
                      mt: 1,
                      bgcolor: "rgba(255,255,255,0.1)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      "&:hover": { 
                        bgcolor: "rgba(255,100,100,0.3)",
                        border: "1px solid rgba(255,100,100,0.5)",
                      },
                    }}
                  >
                    <TrashIcon sx={{ fontSize: "1.2rem", color: "#ff4444" }} />
                  </IconButton>
                </CardContent>
              </Card>
            </motion.div>
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
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Button
              component={Link}
              to="/games/new"
              variant="contained"
              color="primary"
              sx={{
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 15px rgba(63, 81, 181, 0.4)",
                textTransform: "uppercase",
                fontWeight: 600,
                letterSpacing: "1px",
              }}
            >
              Add New Game
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Button
              component={Link}
              to="/games"
              variant="outlined"
              color="primary"
              sx={{
                backdropFilter: "blur(10px)",
                borderColor: "rgba(63, 81, 181, 0.6)",
                color: "#fff",
                textTransform: "uppercase",
                fontWeight: 600,
                letterSpacing: "1px",
                "&:hover": {
                  borderColor: "rgba(63, 81, 181, 1)",
                  backgroundColor: "rgba(63, 81, 181, 0.1)",
                },
              }}
            >
              Display All Games
            </Button>
          </motion.div>
        </Box>
      </Card>
    </motion.div>
  );
};

export default Home;
