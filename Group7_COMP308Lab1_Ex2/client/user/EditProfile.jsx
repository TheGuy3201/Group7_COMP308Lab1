import React, { useState, useEffect } from "react";
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
import { read, update } from "./api-user.js";
import { Navigate, useParams } from "react-router-dom";

<<<<<<< Updated upstream:Group7_COMP308Lab1_Ex2/client/user/EditProfile.jsx
=======
const GET_PLAYER = gql`
  query GetPlayer($playerId: ID!) {
    player(playerId: $playerId) {
      playerId
      username
      email
    }
  }
`;

const UPDATE_PLAYER = gql`
  mutation UpdatePlayer(
    $playerId: ID!
    $username: String
    $email: String
    $password: String
  ) {
    updatePlayer(
      playerId: $playerId
      username: $username
      email: $email
      password: $password
    ) {
      playerId
      username
      email
    }
  }
`;

>>>>>>> Stashed changes:Group7_COMP308Lab2_Ex2/client/user/EditProfile.jsx
export default function EditProfile() {
  const { userId } = useParams();

  const [values, setValues] = useState({
    name: "",
    password: "",
    email: "",
    open: false,
    error: "",
    NavigateToProfile: false,
  });

<<<<<<< Updated upstream:Group7_COMP308Lab1_Ex2/client/user/EditProfile.jsx
  const jwt = auth.isAuthenticated();

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
=======
  const { loading, error, data } = useQuery(GET_PLAYER, {
    variables: { playerId: userId },
    skip: !userId,
    onCompleted: (data) => {
      if (data?.player) {
        setValues((prev) => ({
          ...prev,
          name: data.player.username,
          email: data.player.email,
        }));
      }
    },
  });

  const [updatePlayer] = useMutation(UPDATE_PLAYER);

  const clickSubmit = async () => {
    try {
      const { data } = await updatePlayer({
        variables: {
          playerId: userId,
          username: values.name,
          email: values.email,
          password: values.password || undefined,
        },
      });
>>>>>>> Stashed changes:Group7_COMP308Lab2_Ex2/client/user/EditProfile.jsx

    read({ userId }, { t: jwt.token }, signal).then((data) => {
      if (data?.error) {
        setValues((prev) => ({ ...prev, error: data.error }));
      } else {
        setValues((prev) => ({ ...prev, name: data.name, email: data.email }));
      }
    });

    return () => abortController.abort();
  }, [userId]);

  const clickSubmit = () => {
    const user = {
      name: values.name || undefined,
      email: values.email || undefined,
      password: values.password || undefined,
    };

    update({ userId }, { t: jwt.token }, user).then((data) => {
      if (data?.error) {
        setValues((prev) => ({ ...prev, error: data.error }));
      } else {
        setValues((prev) => ({
          ...prev,
          userId: data._id,
          NavigateToProfile: true,
        }));
      }
    });
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
