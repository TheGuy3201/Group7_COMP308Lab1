import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { create } from "./api-user";

export default function Register() {
  const [values, setValues] = useState({
    name: "",
    password: "",
    error: "",
  });

  const [open, setOpen] = useState(false);

  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const clickSubmit = () => {
    const user = {
      name: values.name || undefined,
      password: values.password || undefined,
    };

    create(user).then((data) => {
      if (data.error) {
        setValues({ ...values, error: data.error });
      } else {
        setOpen(true);
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div>
        <Card
          sx={{
            maxWidth: 400,
            margin: "0 auto",
            mt: 3,
            p: 2,
            textAlign: "center",
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
            borderRadius: "16px",
          }}
        >
          <CardContent>
            <Typography 
              variant="h4" 
              sx={{ fontSize: 24, color: "#e0e0ff", fontWeight: 600, mb: 3 }}
            >
              Register
            </Typography>

            <TextField
              id="name"
              label="Name"
              sx={{
                width: "100%",
                mb: 2,
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
              value={values.name}
              onChange={handleChange("name")}
              margin="normal"
              placeholder="Enter your name"
            />
            <TextField
              id="password"
              label="Password"
              sx={{
                width: "100%",
                mb: 2,
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
              value={values.password}
              onChange={handleChange("password")}
              type="password"
              margin="normal"
              placeholder="Enter your password"
            />

            {values.error && (
              <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  backgroundColor: "rgba(244, 67, 54, 0.2)",
                  borderColor: "rgba(244, 67, 54, 0.5)",
                  border: "1px solid rgba(244, 67, 54, 0.5)",
                  borderRadius: "8px",
                }}
              >
                <Typography sx={{ color: "#ffcdd2", fontWeight: 500 }}>
                  {values.error}
                </Typography>
              </Box>
            )}
          </CardContent>
          <CardActions sx={{ justifyContent: "center", pt: 2 }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                color="primary"
                variant="contained"
                onClick={clickSubmit}
                sx={{
                  mb: 1,
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 4px 15px rgba(63, 81, 181, 0.4)",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  letterSpacing: "1px",
                  px: 4,
                }}
              >
                Submit
              </Button>
            </motion.div>
          </CardActions>
        </Card>

        <Dialog 
          open={open} 
          onClose={handleClose}
          PaperProps={{
            sx: {
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
              borderRadius: "16px",
            }
          }}
        >
          <DialogTitle sx={{ color: "#e0e0ff", fontWeight: 600 }}>
            New Account
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: "rgba(255,255,255,0.8)" }}>
              New account successfully created.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Link to="/login">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  color="primary"
                  autoFocus
                  variant="contained"
                  onClick={handleClose}
                  sx={{
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 4px 15px rgba(63, 81, 181, 0.4)",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    letterSpacing: "1px",
                  }}
                >
                  Login
                </Button>
              </motion.div>
            </Link>
          </DialogActions>
        </Dialog>
      </div>
    </motion.div>
  );
}
