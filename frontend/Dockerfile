# Build stage
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
# Ajoute ces deux lignes pour injecter l'URL :
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Production stage
FROM nginx:alpine
# Copie les fichiers compilés depuis l'étape 'build'
COPY --from=build /app/dist /usr/share/nginx/html
# Remplace la configuration par défaut de Nginx si tu as un fichier spécifique
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
