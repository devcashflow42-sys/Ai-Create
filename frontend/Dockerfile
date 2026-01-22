# Etapa 1: Build
FROM node:18-alpine as build

WORKDIR /app

# Copiar package.json
COPY package.json yarn.lock ./

# Instalar dependencias
RUN yarn install --frozen-lockfile

# Copiar código fuente
COPY . .

# Construir para producción
RUN yarn build

# Etapa 2: Servir con nginx
FROM nginx:alpine

# Copiar build
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuración nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Puerto
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
