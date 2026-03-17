# Microservice + Microfrontend Layout (Federation)
####PLEASE CHANGE YOUR .env URI to end with "assignment3_ex2"####
This project now includes a split structure similar to your reference:

- `client/shell-app` -> host app (routes, main domain UI, consumes remote auth app)
- `client/auth-app` -> auth microfrontend remote exposed via federation (`authApp/AuthPage`)
- `client/game-progress-app` -> game progress microfrontend remote exposed via federation (`gameProgressApp/GameProgressPage`)
- `server/microservices/auth-microservice.js` -> user authentication microservice
- `server/microservices/user-microservice.js` -> user domain microservice
- `server/microservices/game-microservice.js` -> game domain microservice
- `server/gateway.js` -> API gateway for auth and GraphQL

## Run Ports

- Shell host: `5173`
- Auth remote: `5175`
- Game Progress remote: `5176`
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
- Game Progress MFE consumes game progress GraphQL operations through the gateway (`http://localhost:4002/graphql`) with polling-based live updates.
- Shell route `/login` and `/register` are now served by the remote auth microfrontend.
- Shell route `/progress` is served by the remote game progress microfrontend.
- Legacy shell routes `/games`, `/games/new`, and `/game/:gameId` were removed during cleanup in favor of `/progress`.
- Legacy non-shell `client/game/` folder and files (addGame.jsx, games.jsx, gameDetails.jsx, game.css) were also removed during cleanup.
- Root client `client/MainRouter.jsx`, `client/core/Menu.jsx`, and `client/core/Home.jsx` were updated to remove game imports, routes, and queries; Home.jsx now uses leaderboard query with 4s polling.
- Gateway now routes GraphQL user operations to user microservice and game operations to game microservice.
- Existing local auth pages remain in codebase for fallback/reference but are no longer used by routes in `client/shell-app/MainRouter.jsx`.
