// api-auth.js - Authentication API using GraphQL
// This file handles login functionality through GraphQL mutations

import { gql } from '@apollo/client';

// GraphQL mutation for login
export const LOGIN_MUTATION = gql`
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

// Login function (to be used with useMutation hook)
// This is a helper that formats the login data
export const login = async (credentials, apolloClient) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: LOGIN_MUTATION,
      variables: {
        email: credentials.email,
        password: credentials.password
      }
    });

    if (data && data.login) {
      return data.login;
    } else {
      return { error: 'Login failed' };
    }
  } catch (err) {
    console.error('Login error:', err);
    return { error: err.message };
  }
};

// Logout is handled client-side by clearing the JWT token
// See auth-helper.js clearJWT() method
