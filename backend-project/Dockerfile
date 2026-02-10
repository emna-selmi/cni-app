FROM php:8.2-cli

# 1. Install System Dependencies AND the PHP MySQL Driver
RUN apt-get update && apt-get install -y \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo_mysql mbstring \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

WORKDIR /app

# 2. Copy your files
COPY . .

# 3. Fix the Vite binary for Linux
RUN npm install vite --os=linux --cpu=x64

# 4. Start the Laravel server
EXPOSE 3000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=3000"]