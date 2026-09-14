# المرحلة 1: بناء الفرونت إند (استخدام slim لدعم glibc)
FROM node:20-slim AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm config set registry https://registry.npmjs.org/ && \
    npm install --legacy-peer-deps --force
COPY . .
RUN npm run build

# Build the React SPA
WORKDIR /app/frontend
RUN npm config set registry https://registry.npmjs.org/ && \
    npm install --legacy-peer-deps --force
RUN npm run build

# المرحلة 2: تشغيل الباك إند (PHP + Apache)
FROM php:8.2-apache
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd
RUN a2enmod rewrite

ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf ${APACHE_CONFDIR}/conf-available/*.conf

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html
COPY . /var/www/html
COPY --from=build-stage /app/public/build /var/www/html/public/build
COPY --from=build-stage /app/frontend/dist /var/www/html/public

RUN composer install --optimize-autoloader --no-dev --no-scripts
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80

# تشغيل الجداول ثم تشغيل السيرفر
CMD sh -c "php artisan migrate --force && apache2-foreground"