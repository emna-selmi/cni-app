# 1. Build Stage
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm install
# This command creates the 'dist' folder
RUN ./node_modules/.bin/ng build --configuration=production

# 2. Production Stage
FROM nginx:alpine
# We copy from the dist folder created in the build stage above
COPY --from=build /app/dist/gestion-projets-cni/browser /usr/share/nginx/html
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]