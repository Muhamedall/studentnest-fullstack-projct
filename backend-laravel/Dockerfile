# ----------- Build Stage -----------
FROM php:8.2-fpm AS builder

# Install system dependencies including PostgreSQL dev libraries
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libonig-dev libxml2-dev zlib1g-dev curl libpq-dev

# Install PHP extensions (using PostgreSQL)
RUN docker-php-ext-configure zip
RUN docker-php-ext-install pdo pdo_pgsql zip mbstring exif pcntl bcmath

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy composer files and install dependencies
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --no-scripts

# Copy full application
COPY . .

# Fix permissions for Laravel
RUN chown -R www-data:www-data storage bootstrap/cache

# ----------- Production Stage -----------
FROM php:8.2-fpm

# Install system dependencies needed for PHP extensions and server
RUN apt-get update && apt-get install -y \
    nginx supervisor curl libzip-dev libpng-dev libonig-dev libxml2-dev zlib1g-dev libpq-dev

# Install PostgreSQL PHP extension
RUN docker-php-ext-configure zip
RUN docker-php-ext-install pdo pdo_pgsql zip mbstring exif pcntl bcmath

WORKDIR /var/www/html

# Copy built app
COPY --from=builder /var/www/html /var/www/html
COPY --from=builder /usr/bin/composer /usr/bin/composer

# Nginx + Supervisor configs
COPY ./deploy/nginx.conf /etc/nginx/sites-available/default
COPY ./deploy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose HTTP port
EXPOSE 80

# Start Supervisor (no daemon)
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
