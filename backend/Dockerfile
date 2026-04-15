FROM node:24.14.1-alpine AS dev

WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json

RUN npm install

CMD ["npm", "run", "dev", "--workspace", "backend"]

FROM node:24.14.1-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json

RUN npm install

COPY backend ./backend

RUN npm run build --workspace backend

FROM node:24.14.1-alpine AS prod

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json

RUN npm install --omit=dev --workspace backend

COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/.env.example ./backend/.env.example

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace", "backend"]
