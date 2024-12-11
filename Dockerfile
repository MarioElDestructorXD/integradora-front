# Etapa de construcción
FROM node:18 AS build
WORKDIR /app

# Copia archivos de configuración de npm y Vue
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código de la aplicación y construirla
COPY . .
RUN npm run build

# Etapa de producción (Nginx)
FROM nginx:alpine

# Copiar los archivos compilados desde la etapa de construcción a la carpeta de>
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto de Nginx
EXPOSE 80

# Comando de inicio de Nginx
CMD ["nginx", "-g", "daemon off;"]