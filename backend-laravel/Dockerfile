# Stage 1: build + composer
FROM php:8.2-fpm AS base

# system deps
RUN apt-get update && apt-get install -y \
    git zip unzip libpq-dev libonig-dev libzip-dev curl nginx supervisor \
    && docker-php-ext-install pdo pdo_pgsql mbstring zip

# install composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy full application first
COPY . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# build frontend if present (optional)
RUN if [ -f package.json ]; then npm ci && npm run build; fi

# artisan optimizations
RUN php artisan config:cache || true
RUN php artisan route:cache || true
RUN php artisan view:cache || true

# Stage 2: production image with nginx + php-fpm
FROM php:8.2-fpm

# runtime packages
RUN apt-get update && apt-get install -y nginx supervisor libpq5

WORKDIR /var/www

# copy built app
COPY --from=base /var/www /var/www

# permissions
RUN chown -R www-data:www-data storage bootstrap/cache

# nginx config
COPY docker/nginx/default.conf /etc/nginx/sites-available/default

# supervisor config
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80

CMD ["/usr/bin/supervisord", "-n"]
