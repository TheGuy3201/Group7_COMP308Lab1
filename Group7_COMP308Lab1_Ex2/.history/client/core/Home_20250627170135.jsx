/*import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import unicornbikeImg from "./../assets/images/unicornbikeImg.jpg";

const Home = () => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        maxWidth: 600,
        margin: "auto",
        mt: 5,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          px: 2.5,
          pt: 3,
          pb: 2,
          color: theme.custom?.openTitle || theme.palette.primary.main,
        }}
      >
        Home Page
      </Typography>
      <CardMedia
        sx={{ minHeight: 400 }}
        image={unicornbikeImg}
        title="Unicorn Bike"
      />
      <CardContent>
        <Typography variant="body2" component="p">
          Welcome to the MERN Skeleton home page.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Home;
*/

import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import unicornbikeImg from "./../assets/images/unicornbikeImg.jpg";

const Home = () => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        maxWidth: 700,
        margin: "auto",
        mt: 5,
        p: 2,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          px: 2.5,
          pt: 3,
          pb: 2,
          color: theme.custom?.openTitle || theme.palette.primary.main,
          textAlign: "center",
        }}
      >
        Home Page
      </Typography>

      <CardMedia
        component="img"
        image={unicornbikeImg}
        alt="Unicorn Bike"
        sx={{
          height: 450,
          width: "auto",
          maxWidth: "100%",
          display: "",
          margin: "0 auto",
          objectFit: "cover",
        }}
      />

      <CardContent>
        <Typography variant="body2" component="p" sx={{ textAlign: "center" }}>
          Welcome to the MERN Skeleton home page.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Home;
