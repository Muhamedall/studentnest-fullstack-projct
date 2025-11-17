# Stage 1: build + composer
FROM php:8.2-fpm AS base

# system deps
RUN apt-get update && apt-get install -y \
    git zip unzip libpq-dev libonig-dev libzip-dev curl nginx supervisor \
    && docker-php-ext-install pdo pdo_pgsql mbstring zip

# install composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# copy composer files then install (cache layer)
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# copy app
COPY . .

# build frontend if present (optional)
RUN if [ -f package.json ]; then npm ci && npm run build; fi

# run artisan optimizations
RUN php artisan config:cache || true
RUN php artisan route:cache || true
RUN php artisan view:cache || true

# Stage 2: production image with nginx + php-fpm
FROM php:8.2-fpm

# required packages for runtime
RUN apt-get update && apt-get install -y nginx supervisor libpq5

# copy php files from builder
WORKDIR /var/www
COPY --from=base /var/www /var/www

# setup permissions (adjust as needed)
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# nginx site config
COPY docker/nginx/default.conf /etc/nginx/sites-available/default

# supervisor to manage php-fpm + nginx
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80

CMD ["/usr/bin/supervisord", "-n"]
