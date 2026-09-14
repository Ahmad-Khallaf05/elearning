# ==========================================
# المرحلة 1: بناء الفرونت إند (React / Vite)
# ==========================================
FROM node:20-alpine AS build-stage

WORKDIR /app

# نسخ ملفات الحزم أولاً لتسريع الكاش
COPY package*.json ./

# التثبيت مع تخطي تعارضات الإصدارات
RUN npm install --legacy-peer-deps

# نسخ باقي المشروع وعمل البناء
COPY . .
RUN npm run build

# ==========================================
# المرحلة 2: تشغيل الباك إند (PHP + Apache)
# ==========================================
FROM php:8.2-apache

# تثبيت المتطلبات الضرورية للنظام
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# تثبيت ملحقات PHP
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# تفعيل mod_rewrite
RUN a2enmod rewrite

# ضبط مسار التشغيل ليشير إلى مجلد public
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf ${APACHE_CONFDIR}/conf-available/*.conf

# جلب Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# نسخ ملفات المشروع
COPY . /var/www/html

# نسخ الملفات التي تم بناؤها من مرحلة React فقط
COPY --from=build-stage /app/public/build /var/www/html/public/build

# تثبيت حزم الـ PHP
RUN composer install --optimize-autoloader --no-dev --no-scripts

# ضبط صلاحيات المجلدات
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80

CMD ["apache2-foreground"]