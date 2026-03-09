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
import { useMutation, gql } from "@apollo/client";

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      player {
        playerId
        username
        email
        avatarIMG
      }
      message
    }
  }
`;

export default function Login() {
  const location = useLocation();

  const [values, setValues] = useState({
    email: "",
    password: "",
    error: "",
    redirectToReferrer: false,
  });

  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION);

  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value });
  };

  const clickSubmit = async () => {
    try {
      const { data } = await loginMutation({
        variables: {
          email: values.email,
          password: values.password,
        },
      });

      if (data && data.login) {
        auth.authenticate(data.login, () => {
          setValues({
            ...values,
            error: "",
            redirectToReferrer: true,
          });
        });
      }
    } catch (err) {
      setValues({ ...values, error: err.message });
    }
  };

  const { from } = location.state || {
    from: { pathname: "/" },
  };

  if (values.redirectToReferrer) {
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
            label="Email"
            type="email"
            value={values.email}
            onChange={handleChange("email")}
            margin="normal"
            InputProps={{
              style: { color: "#ffffff" },
            }}
            InputLabelProps={{
              style: { color: "#e0e0ff" },
            }}
            sx={{
              mx: 1,
              width: 300,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#64c8ff",
                },
              },
            }}
          />
          <br />

          <TextField
            id="password"
            type="password"
            label="Password"
            value={values.password}
            onChange={handleChange("password")}
            margin="normal"
            InputProps={{
              style: { color: "#ffffff" },
            }}
            InputLabelProps={{
              style: { color: "#e0e0ff" },
            }}
            sx={{
              mx: 1,
              width: 300,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#64c8ff",
                },
              },
            }}
          />
          <br />

          {values.error && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                backgroundColor: "rgba(244, 67, 54, 0.2)",
                border: "1px solid rgba(244, 67, 54, 0.5)",
                borderRadius: "8px",
              }}
            >
              <Typography sx={{ color: "#ffcdd2", fontWeight: 500 }}>
                <Icon sx={{ verticalAlign: "middle", mr: 0.5 }}>error</Icon>
                {values.error}
              </Typography>
            </Box>
          )}
        </CardContent>

        <CardActions sx={{ justifyContent: "center", pt: 2 }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Button
              color="primary"
              variant="contained"
              onClick={clickSubmit}
              sx={{ px: 4, fontWeight: 600 }}
            >
              Submit
            </Button>
          </motion.div>
        </CardActions>
      </Card>
    </motion.div>
  );
}
