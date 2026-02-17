import React, { useState } from "react";
import { gql, useMutation } from '@apollo/client';
import { motion } from "framer-motion";
import auth from "../lib/auth-helper.js";
import "./game.css";

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

const ADD_GAME = gql`
    mutation AddGame(
        # define input variables
        $title: String!,
        $genre: String!,
        $platform: String!,
        $releaseYear: Int!,
        $developer: String!,
        $rating: Float!,
        $description: String!     
        ) {
        addGame(        
              # provide values for the variables
              title: $title,
              genre: $genre,
              platform: $platform,
              releaseYear: $releaseYear,
              developer: $developer,
              rating: $rating,
              description: $description            
            ) 
            # This is what the query will return when it is called
            {
                gameId
                title
                genre
                platform
                releaseYear
                developer
                rating
                description
            }
    }
`;

export default function AddGame() {
  let navigate = useNavigate();
  const jwt = auth.isAuthenticated();
  const [addGame, { data, loading, error }] = useMutation(ADD_GAME);

  if (loading) return 'Submitting...';
  if (error) return `Submission error! ${error.message}`;

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

    addGame({ variables: game }).then(({ data }) => {
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
      <Box className="game-form-container">
        <Card className="glass-card">
          <CardContent className="glass-card-content">
            <Typography 
              variant="h4" 
              gutterBottom 
              className="game-form-title"
            >
              Add New Game
            </Typography>

            {values.success && (
              <Alert 
                severity="success" 
                className="alert-success"
              >
                Game successfully added! Redirecting to games list...
              </Alert>
            )}

            {values.error && (
              <Alert 
                severity="error" 
                className="alert-error"
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
              className="glass-textfield"
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
              className="glass-textfield"
            />

            <TextField
              id="platform"
              label="Platform"
              value={values.platform}
              onChange={handleChange("platform")}
              margin="normal"
              fullWidth
              placeholder="e.g., PC, PlayStation, Xbox, Nintendo Switch"
              className="glass-textfield"
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
              className="glass-textfield"
            />

            <TextField
              id="developer"
              label="Developer"
              value={values.developer}
              onChange={handleChange("developer")}
              margin="normal"
              fullWidth
              placeholder="Enter game developer/studio"
              className="glass-textfield"
            />

            <FormControl fullWidth margin="normal" className="rating-slider">
              <InputLabel 
                shrink 
                className="rating-label"
              >
                Rating: {values.rating}/10
              </InputLabel>
              <Box className="rating-slider-container">
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
              className="glass-textfield"
            />

            <Box className="button-container">
              <motion.div 
                className="button-wrapper"
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={clickSubmit}
                  disabled={!values.title || !values.genre || values.success}
                  fullWidth
                  className="primary-button"
                >
                  Add Game
                </Button>
              </motion.div>
              <motion.div 
                className="button-wrapper"
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate("/games")}
                  fullWidth
                  className="outlined-button"
                >
                  Cancel
                </Button>
              </motion.div>
            </Box>

            <Typography 
              variant="caption" 
              className="game-form-caption"
            >
              * Required fields
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </motion.div>
  );
}
