import React from "react";
import ReactDOM from "react-dom/client";
import { ApolloClient, ApolloProvider, InMemoryCache, HttpLink } from "@apollo/client";
import App from "./App.jsx";

const graphqlBase = import.meta.env.VITE_AUTH_GRAPHQL_BASE || "http://localhost:4002/graphql";

const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: graphqlBase }),
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);
