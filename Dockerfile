# --- Stage 1: Build the React application ---
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# --- Stage 2: Serve with NGINX ---
FROM nginx:alpine

# Copy the build output to NGINX
COPY --from=build /app/dist /usr/share/nginx/html

# Remove the default NGINX config
RUN rm /etc/nginx/conf.d/default.conf

# Create a new config that enables gzip, caching, and a fallback to /index.html
RUN printf "server {\n\
    listen 80;\n\
    server_name _;\n\
    \n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    \n\
    gzip on;\n\
    gzip_types\n\
    text/plain\n\
    text/css\n\
    application/json\n\
    application/javascript\n\
    application/x-javascript\n\
    text/xml\n\
    application/xml\n\
    application/xml+rss\n\
    image/svg+xml;\n\
    gzip_proxied any;\n\
    gzip_comp_level 6;\n\
    gzip_vary on;\n\
    \n\
    location ~* \\.(?:css|js|gif|jpe?g|png|woff2?|eot|ttf|otf|svg)$ {\n\
    try_files \$uri =404;\n\
    add_header Cache-Control \"public, max-age=2592000\";\n\
    }\n\
    \n\
    location / {\n\
    try_files \$uri \$uri/ /index.html;\n\
    }\n\
    }\n" > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
