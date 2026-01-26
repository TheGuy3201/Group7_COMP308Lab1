import { createTheme } from "@mui/material/styles";
import { pink } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    mode: "light", // replaces `type: 'light'` in MUI v5
    primary: {
      light: "#5c67a3",
      main: "#3f4771",
      dark: "#2e355b",
      contrastText: "#fff",
    },
    secondary: {
      light: "#ff79b0",
      main: "#ff4081",
      dark: "#c60055",
      contrastText: "#000",
    },
  },
  typography: {
    // `useNextVariants` is removed in MUI v5; it's on by default
  },
  custom: {
    openTitle: "#3f4771",
    protectedTitle: pink[400],
  },
});

export default theme;
