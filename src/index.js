import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from "react-oidc-context";
import App from './App';

const authority = process.env.REACT_APP_COGNITO_AUTHORITY;
const clientId = process.env.REACT_APP_COGNITO_CLIENT_ID;
const redirectUri = process.env.REACT_APP_REDIRECT_URI;
const logoutUri = process.env.REACT_APP_LOGOUT_URI;
const userPoolId = process.env.REACT_APP_COGNITO_USER_POOL_ID;

const oidcConfig = {
  authority: authority,
  client_id: clientId,
  redirect_uri: redirectUri,
  post_logout_redirect_uri: logoutUri,
  automaticSilentRenew: false,
  response_type: "code",
  scope: "openid email profile",
  metadata: {
    issuer: authority,
    authorization_endpoint: `${authority}/oauth2/authorize`,
    token_endpoint: `${authority}/oauth2/token`,
    userinfo_endpoint: `${authority}/oauth2/userInfo`,
    jwks_uri: `https://cognito-idp.ap-south-1.amazonaws.com/${userPoolId}/.well-known/jwks.json`,
    end_session_endpoint: `${authority}/logout`
  }
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <AuthProvider {...oidcConfig}>
    <App />
  </AuthProvider>
);