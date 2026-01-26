//import React from "react"; // Optional in React 17+ if using JSX transform
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles"; //  Updated import for MUI v5
//import CssBaseline from "@mui/material/CssBaseline"; // Optional: resets browser styling
import MainRouter from "../MainRouter";
import theme from "../theme";

const App = () => {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />{" "}
        {/* Optional but recommended for consistent baseline styles */}
        <MainRouter />
      </ThemeProvider>
    </Router>
  );
};

export default App;
