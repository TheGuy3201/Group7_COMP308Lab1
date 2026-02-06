import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Slider,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import auth from "../lib/auth-helper.js";
import { create } from "./api-game.js";

export default function AddGame() {
  const navigate = useNavigate();
  const jwt = auth.isAuthenticated();

  const [values, setValues] = useState({
    title: "",
    genre: "",
    platform: "",
    releaseYear: new Date().getFullYear(),
    developer: "",
    rating: 5,
    description: "",
    error: "",
    success: false,
  });

  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value, error: "" });
  };

  const handleRatingChange = (event, newValue) => {
    setValues({ ...values, rating: newValue, error: "" });
  };

  const clickSubmit = () => {
    const game = {
      title: values.title || undefined,
      genre: values.genre || undefined,
      platform: values.platform || undefined,
      releaseYear: values.releaseYear || undefined,
      developer: values.developer || undefined,
      rating: values.rating,
      description: values.description || undefined,
    };

    create(game, { t: jwt.token }).then((data) => {
      if (data && data.error) {
        setValues({ ...values, error: data.error });
      } else {
        setValues({
          ...values,
          title: "",
          genre: "",
          platform: "",
          releaseYear: new Date().getFullYear(),
          developer: "",
          rating: 5,
          description: "",
          error: "",
          success: true,
        });
        setTimeout(() => {
          navigate("/games");
        }, 2000);
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Box sx={{ p: 3, maxWidth: 800, margin: "auto" }}>
        <Card
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
            borderRadius: "16px",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ mb: 3, color: "#e0e0ff", fontWeight: 600 }}
            >
              Add New Game
            </Typography>

            {values.success && (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3,
                  backgroundColor: "rgba(76, 175, 80, 0.2)",
                  borderColor: "rgba(76, 175, 80, 0.5)",
                  color: "#c8e6c9"
                }}
              >
                Game successfully added! Redirecting to games list...
              </Alert>
            )}

            {values.error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  backgroundColor: "rgba(244, 67, 54, 0.2)",
                  borderColor: "rgba(244, 67, 54, 0.5)",
                  color: "#ffcdd2"
                }}
              >
                {values.error}
              </Alert>
            )}

            <TextField
              id="title"
              label="Title *"
              value={values.title}
              onChange={handleChange("title")}
              margin="normal"
              fullWidth
              required
              placeholder="Enter game title"
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#fff",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.4)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(100, 200, 255, 0.6)",
                  },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "rgba(255, 255, 255, 0.5)",
                  opacity: 1,
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                },
              }}
            />

            <TextField
              id="genre"
              label="Genre *"
              value={values.genre}
              onChange={handleChange("genre")}
              margin="normal"
              fullWidth
              required
              placeholder="e.g., Action, RPG, Strategy"
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#fff",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.4)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(100, 200, 255, 0.6)",
                  },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "rgba(255, 255, 255, 0.5)",
                  opacity: 1,
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                },
              }}
            />

            <TextField
              id="platform"
              label="Platform"
              value={values.platform}
              onChange={handleChange("platform")}
              margin="normal"
              fullWidth
              placeholder="e.g., PC, PlayStation, Xbox, Nintendo Switch"
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#fff",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.4)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(100, 200, 255, 0.6)",
                  },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "rgba(255, 255, 255, 0.5)",
                  opacity: 1,
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                },
              }}
            />

            <TextField
              id="releaseYear"
              label="Release Year"
              type="number"
              value={values.releaseYear}
              onChange={handleChange("releaseYear")}
              margin="normal"
              fullWidth
              inputProps={{ min: 1970, max: new Date().getFullYear() + 5 }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#fff",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.4)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(100, 200, 255, 0.6)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                },
              }}
            />

            <TextField
              id="developer"
              label="Developer"
              value={values.developer}
              onChange={handleChange("developer")}
              margin="normal"
              fullWidth
              placeholder="Enter game developer/studio"
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#fff",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.4)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(100, 200, 255, 0.6)",
                  },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "rgba(255, 255, 255, 0.5)",
                  opacity: 1,
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                },
              }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel 
                shrink 
                sx={{ 
                  bgcolor: "transparent", 
                  px: 1,
                  color: "rgba(255, 255, 255, 0.7)",
                }}
              >
                Rating: {values.rating}/10
              </InputLabel>
              <Box sx={{ px: 2, pt: 4, pb: 2 }}>
                <Slider
                  value={values.rating}
                  onChange={handleRatingChange}
                  min={0}
                  max={10}
                  step={0.5}
                  marks={[
                    { value: 0, label: "0" },
                    { value: 5, label: "5" },
                    { value: 10, label: "10" },
                  ]}
                  valueLabelDisplay="auto"
                  sx={{
                    color: "rgba(100, 200, 255, 0.8)",
                    "& .MuiSlider-markLabel": {
                      color: "rgba(255, 255, 255, 0.6)",
                    },
                  }}
                />
              </Box>
            </FormControl>

            <TextField
              id="description"
              label="Description"
              value={values.description}
              onChange={handleChange("description")}
              margin="normal"
              fullWidth
              multiline
              rows={4}
              placeholder="Enter a description of the game"
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#fff",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.4)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(100, 200, 255, 0.6)",
                  },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "rgba(255, 255, 255, 0.5)",
                  opacity: 1,
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                },
              }}
            />

            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
              <motion.div 
                style={{ flex: 1 }}
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={clickSubmit}
                  disabled={!values.title || !values.genre || values.success}
                  fullWidth
                  sx={{
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 4px 15px rgba(63, 81, 181, 0.4)",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    letterSpacing: "1px",
                  }}
                >
                  Add Game
                </Button>
              </motion.div>
              <motion.div 
                style={{ flex: 1 }}
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate("/games")}
                  fullWidth
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
                  Cancel
                </Button>
              </motion.div>
            </Box>

            <Typography 
              variant="caption" 
              sx={{ mt: 2, display: "block", color: "rgba(255, 255, 255, 0.6)" }}
            >
              * Required fields
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </motion.div>
  );
}
