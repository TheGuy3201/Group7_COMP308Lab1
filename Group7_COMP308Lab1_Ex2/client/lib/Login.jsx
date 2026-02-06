import React, { useState } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Icon from "@mui/material/Icon";
import Box from "@mui/material/Box";
import { motion } from "framer-motion";
import auth from "./auth-helper.js";
import { Navigate, useLocation } from "react-router-dom";
import { login } from "./api-auth.js";

export default function Login() {
  const location = useLocation();

  const [values, setValues] = useState({
    email: "",
    password: "",
    error: "",
    redirectToReferrer: false,
  });

  const clickSubmit = () => {
    const user = {
      email: values.email || undefined,
      password: values.password || undefined,
    };
    login(user).then((data) => {
      if (data.error) {
        setValues({ ...values, error: data.error });
      } else {
        auth.authenticate(data, () => {
          setValues({ ...values, error: "", redirectToReferrer: true });
        });
      }
    });
  };

  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value });
  };

  const { from } = location.state || {
    from: { pathname: "/" },
  };

  const { redirectToReferrer } = values;
  if (redirectToReferrer) {
    return <Navigate to={from} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card
        sx={{
          maxWidth: 600,
          margin: "auto",
          textAlign: "center",
          mt: 5,
          pb: 2,
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
            sx={{ mt: 2, color: "#e0e0ff", fontWeight: 600, mb: 3 }}
          >
            Login
          </Typography>
          <TextField
            id="email"
            type="email"
            label="Email"
            sx={{
              mx: 1,
              width: 300,
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
            value={values.email}
            onChange={handleChange("email")}
            margin="normal"
          />
          <br />
          <TextField
            id="password"
            type="password"
            label="Password"
            sx={{
              mx: 1,
              width: 300,
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
            margin="normal"
          />
          <br />
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
              <Typography component="p" sx={{ color: "#ffcdd2", fontWeight: 500 }}>
                <Icon 
                  color="error" 
                  sx={{ 
                    verticalAlign: "middle", 
                    mr: 0.5,
                    color: "#ff6b6b"
                  }}
                >
                  error
                </Icon>
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
    </motion.div>
  );
}
