# ----------- Build Stage -----------
FROM php:8.2-fpm AS builder

RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libonig-dev libxml2-dev zlib1g-dev curl libpq-dev

RUN docker-php-ext-configure zip
RUN docker-php-ext-install pdo pdo_pgsql pgsql zip mbstring exif pcntl bcmath

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy FULL project FIRST (artisan must exist before composer install)
COPY . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Set permissions
RUN chown -R www-data:www-data storage bootstrap/cache



# ----------- Production Stage -----------
FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    nginx supervisor curl libzip-dev libpng-dev libonig-dev libxml2-dev zlib1g-dev libpq-dev

RUN docker-php-ext-configure zip
RUN docker-php-ext-install pdo pdo_pgsql pgsql zip mbstring exif pcntl bcmath

WORKDIR /var/www/html

# Copy built app from builder stage
COPY --from=builder /var/www/html /var/www/html
COPY --from=builder /usr/bin/composer /usr/bin/composer

# Copy configs
COPY ./deploy/nginx.conf /etc/nginx/sites-available/default
COPY ./deploy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY ./deploy/php-fpm.conf /usr/local/etc/php-fpm.d/www.conf

EXPOSE 80

CMD ["/usr/bin/supervisord", "-n"]
