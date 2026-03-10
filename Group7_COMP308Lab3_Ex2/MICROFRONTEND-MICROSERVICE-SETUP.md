# Microservice + Microfrontend Layout (Federation)

This project now includes a split structure similar to your reference:

- `client/shell-app` -> host app (routes, main domain UI, consumes remote auth app)
- `client/auth-app` -> auth microfrontend remote exposed via federation (`authApp/AuthPage`)
- `server/microservices/auth-microservice.js` -> user authentication microservice
- `server/microservices/user-microservice.js` -> user domain microservice
- `server/microservices/game-microservice.js` -> game domain microservice
- `server/gateway.js` -> API gateway for auth and GraphQL

## Run Ports

- Shell host: `5173`
- Auth remote: `5175`
- Upload/static service (existing server.js): `4000`
- Auth microservice: `4001`
- User microservice: `4003`
- Game microservice: `4004`
- Gateway: `4002`

## Start Commands

From project root:

1. `npm run install:all`
2. `npm run dev:all`

## Notes

- Auth MFE stores login session in `sessionStorage.jwt` using the same shape expected by the existing shell app.
- Shell route `/login` and `/register` are now served by the remote auth microfrontend.
- Gateway now routes GraphQL user operations to user microservice and game operations to game microservice.
- Existing local auth pages remain in codebase for fallback/reference but are no longer used by routes in `client/shell-app/MainRouter.jsx`.
