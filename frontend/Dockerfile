FROM node:24.14.1-alpine AS dev

WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json

RUN npm install

CMD ["npm", "run", "dev", "--workspace", "frontend"]

FROM node:24.14.1-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json

RUN npm install

COPY frontend ./frontend

RUN npm run build --workspace frontend

FROM nginx:1.27-alpine AS prod

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
# 拷贝到nginx指定的目录下
COPY --from=build /app/frontend/dist /usr/share/nginx/html

EXPOSE 80
