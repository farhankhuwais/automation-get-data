FROM php:8.2-fpm-alpine

LABEL maintainer="AutomationGetData"

ENV PHP_MEMORY_LIMIT=256M
ENV PHP_POST_MAX_SIZE=100M
ENV PHP_UPLOAD_MAX_FILESIZE=100M

RUN apk add --no-cache \
    bash \
    curl \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    linux-headers \
    autoconf \
    g++ \
    make \
    icu-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd sockets intl opcache

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /var/www/html

COPY composer.json ./
RUN composer update --no-dev --no-interaction --no-scripts

COPY . .

RUN composer dump-autoload --optimize --no-dev
RUN composer run-script post-autoload-dump 2>/dev/null || true

RUN mkdir -p storage/framework/{cache,sessions,testing,views} \
    && mkdir -p storage/logs \
    && mkdir -p bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
