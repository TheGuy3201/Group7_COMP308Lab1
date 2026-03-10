import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import {
  Card,
  CardActions,
  CardContent,
  Button,
  TextField,
  Typography,
  Icon,
} from "@mui/material";
import auth from "../lib/auth-helper.js";
import { Navigate, useParams } from "react-router-dom";

const GET_USER = gql`
  query GetUser($userId: ID!) {
    user(userId: $userId) {
      userId
      username
      email
      role
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser(
    $userId: ID!
    $username: String
    $email: String
    $password: String
  ) {
    updateUser(
      userId: $userId
      username: $username
      email: $email
      password: $password
    ) {
      userId
      username
      email
      role
    }
  }
`;

export default function EditProfile() {
  const { userId } = useParams();

  const [values, setValues] = useState({
    name: "",
    password: "",
    email: "",
    role: "",
    error: "",
    NavigateToProfile: false,
  });

  const { loading, error, data } = useQuery(GET_USER, {
    variables: { userId: userId },
    skip: !userId,
    onCompleted: (data) => {
      if (data?.role) {
        setValues((prev) => ({
          ...prev,
          name: data.user.username,
          email: data.user.email,
          role: data.user.role,
        }));
      }
    },
  });

  const [updateUser] = useMutation(UPDATE_USER);

  const clickSubmit = async () => {
    try {
      const { data } = await updateUser({
        variables: {
          userId: userId,
          username: values.name,
          email: values.email,
          password: values.password || undefined,
        },
      });

      if (data?.updateUser) {
        setValues((prev) => ({
          ...prev,
          userId: data.updateUser.userId,
          NavigateToProfile: true,
        }));
      }
    } catch (err) {
      setValues((prev) => ({ ...prev, error: err.message }));
    }
  };

  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value });
  };

  if (values.NavigateToProfile) {
    return <Navigate to={`/user/${values.userId}`} />;
  }

  return (
    <Card
      sx={{
        maxWidth: 600,
        mx: "auto",
        mt: 5,
        textAlign: "center",
        pb: 2,
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
          Edit Profile
        </Typography>

        <TextField
          id="name"
          label="Name"
          value={values.name}
          onChange={handleChange("name")}
          margin="normal"
          sx={{ mx: 1, width: 300 }}
        />
        <br />

        <TextField
          id="email"
          type="email"
          label="Email"
          value={values.email}
          onChange={handleChange("email")}
          margin="normal"
          sx={{ mx: 1, width: 300 }}
        />
        <br />

        <TextField
          id="password"
          type="password"
          label="Password"
          value={values.password}
          onChange={handleChange("password")}
          margin="normal"
          sx={{ mx: 1, width: 300 }}
        />
        <br />

        <TextField
          id="role"
          type="text"
          label="Role"
          value={values.role}
          onChange={handleChange("role")}
          margin="normal"
          sx={{ mx: 1, width: 300 }}
        />
        <br />

        {values.error && (
          <Typography component="p" color="error" sx={{ mt: 1 }}>
            <Icon color="error" sx={{ verticalAlign: "middle", mr: 1 }}>
              error
            </Icon>
            {values.error}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: "center" }}>
        <Button
          color="primary"
          variant="contained"
          onClick={clickSubmit}
          sx={{ mb: 2 }}
        >
          Submit
        </Button>
      </CardActions>
    </Card>
  );
}