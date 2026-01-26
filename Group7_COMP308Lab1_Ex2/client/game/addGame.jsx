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
    <Box sx={{ p: 3, maxWidth: 800, margin: "auto" }}>
      <Card elevation={4}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" color="primary" gutterBottom sx={{ mb: 3 }}>
            Add New Game
          </Typography>

          {values.success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Game successfully added! Redirecting to games list...
            </Alert>
          )}

          {values.error && (
            <Alert severity="error" sx={{ mb: 3 }}>
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
          />

          <TextField
            id="platform"
            label="Platform"
            value={values.platform}
            onChange={handleChange("platform")}
            margin="normal"
            fullWidth
            placeholder="e.g., PC, PlayStation, Xbox, Nintendo Switch"
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
          />

          <TextField
            id="developer"
            label="Developer"
            value={values.developer}
            onChange={handleChange("developer")}
            margin="normal"
            fullWidth
            placeholder="Enter game developer/studio"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel shrink sx={{ bgcolor: "background.paper", px: 1 }}>
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
                color="primary"
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
          />

          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={clickSubmit}
              disabled={!values.title || !values.genre || values.success}
              fullWidth
            >
              Add Game
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/games")}
              fullWidth
            >
              Cancel
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
            * Required fields
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
