/*import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { makeStyles } from "@mui/styles";
import Card from "@mui/material/Card";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import { list } from "./api-user.js";
import { Link as RouterLink } from "react-router-dom";
import Link from "@mui/material/Link";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
//import Person from '@material-ui/core/Person'
//import ArrowForward from '@material-ui/core/ArrowForward'
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
//import ArrowForward from '@material-ui/core/ArrowForward'
import ArrowForward from "@mui/icons-material/ArrowForward";
import unicornbikeImg from "./../assets/images/unicornbikeImg.jpg";

const useStyles = makeStyles((theme) => ({
  card: {
    // Define your card styles here
  },
  textField: {
    // Define your text field styles here
  },
  error: {
    // Define your error icon styles here
  },
  submit: {
    // Define your submit button styles here
  },
  title: {
    // Define your title styles here
  },
  root: {
    // Define your root styles here
  },
}));

export default function Users() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    list(signal).then((data) => {
      console.log(data);
      if (data && data.error) {
        console.log(data.error);
      } else {
        console.log(data);
        setUsers(data);
      }
    });
    return function cleanup() {
      abortController.abort();
    };
  }, []);

  const classes = useStyles();
  return (
    <Paper className={classes.root} elevation={4}>
      <Typography variant="h6" className={classes.title}>
        All Users
      </Typography>
      <List dense>
        {users.map((item, i) => {
          return (
            <Link component={RouterLink} to={"/user/" + item._id} key={i}>
              <ListItem button>
                <ListItemAvatar>
                  <Avatar></Avatar>
                </ListItemAvatar>
                <ListItemText primary={item.name} />
                <ListItemSecondaryAction>
                  <IconButton>
                    <ArrowForward />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </Link>
          );
        })}
      </List>
    </Paper>
  );
}
*/

import React, { useState, useEffect } from "react";
import {
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Avatar,
  Typography,
  Link,
} from "@mui/material";
import ArrowForward from "@mui/icons-material/ArrowForward";
import { list } from "./api-user.js";
import { Link as RouterLink } from "react-router-dom";

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    list(signal).then((data) => {
      if (data?.error) {
        console.log(data.error);
      } else {
        setUsers(data);
      }
    });

    return () => abortController.abort();
  }, []);

  return (
    <Paper
      elevation={4}
      sx={{
        maxWidth: 600,
        mx: "auto",
        mt: 5,
        p: 3,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
        All Users
      </Typography>
      <List dense>
        {users.map((item, i) => (
          <Link
            component={RouterLink}
            to={`/user/${item._id}`}
            underline="none"
            key={item._id}
            sx={{ color: "inherit" }}
          >
            <ListItem button>
              <ListItemAvatar>
                <Avatar />
              </ListItemAvatar>
              <ListItemText primary={item.name} />
              <ListItemSecondaryAction>
                <IconButton edge="end">
                  <ArrowForward />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </Link>
        ))}
      </List>
    </Paper>
  );
}
