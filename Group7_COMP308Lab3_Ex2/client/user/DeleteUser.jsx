import React, { useState } from "react";
import PropTypes from "prop-types";
import { useMutation, gql } from "@apollo/client";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import auth from "../lib/auth-helper.js";
import { Navigate } from "react-router-dom";

const DELETE_PLAYER = gql`
  mutation DeletePlayer($playerId: ID!) {
    deletePlayer(playerId: $playerId)
  }
`;

export default function DeleteUser({ userId }) {
  const [open, setOpen] = useState(false);
  const [redirect, setRedirect] = useState(false);

  const [deletePlayer] = useMutation(DELETE_PLAYER);

  const clickButton = () => {
    setOpen(true);
  };

  const deleteAccount = async () => {
    try {
      const { data } = await deletePlayer({
        variables: { playerId: userId }
      });

      if (data?.deletePlayer) {
        auth.clearJWT(() => console.log("deleted"));
        setRedirect(true);
      }
    } catch (err) {
      console.error("Delete error:", err.message);
    }
  };

  const handleRequestClose = () => {
    setOpen(false);
  };

  if (redirect) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <IconButton
        aria-label="Delete account"
        onClick={clickButton}
        color="error"
      >
        <DeleteIcon />
      </IconButton>

      <Dialog open={open} onClose={handleRequestClose}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action is
            irreversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRequestClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={deleteAccount}
            color="error"
            variant="contained"
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

DeleteUser.propTypes = {
  userId: PropTypes.string.isRequired,
};
