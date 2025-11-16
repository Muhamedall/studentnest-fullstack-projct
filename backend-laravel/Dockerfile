# ----------- Build Stage -----------
FROM php:8.2-fpm AS builder

# Install system dependencies including PostgreSQL dev libraries
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libonig-dev libxml2-dev zlib1g-dev curl libpq-dev

# Install PHP extensions: replace pdo_mysql with pdo_pgsql
RUN docker-php-ext-configure zip
RUN docker-php-ext-install pdo pdo_pgsql zip mbstring exif pcntl bcmath

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy composer files and install dependencies (no dev)
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --no-scripts

# Copy app files
COPY . .

# Fix permissions for Laravel
RUN chown -R www-data:www-data storage bootstrap/cache

# ----------- Production Stage -----------
FROM php:8.2-fpm

# Install system dependencies needed for PHP extensions and server
RUN apt-get update && apt-get install -y \
    nginx supervisor curl libzip-dev libpng-dev libonig-dev libxml2-dev zlib1g-dev libpq-dev

# Install PHP extensions: replace pdo_mysql with pdo_pgsql
RUN docker-php-ext-configure zip
RUN docker-php-ext-install pdo pdo_pgsql zip mbstring exif pcntl bcmath

WORKDIR /var/www/html

# Copy app and composer from builder
COPY --from=builder /var/www/html /var/www/html
COPY --from=builder /usr/bin/composer /usr/bin/composer

# Copy Nginx and Supervisor configuration files (adjust paths if needed)
COPY ./deploy/nginx.conf /etc/nginx/sites-available/default
COPY ./deploy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose HTTP port
EXPOSE 80

# Start Supervisor to manage PHP-FPM and Nginx
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
