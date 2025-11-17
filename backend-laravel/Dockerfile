FROM richarvey/nginx-php-fpm:3.1.6

WORKDIR /var/www/html

# Copy all files including .env (make sure your .env is set properly in Render env vars)
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --prefer-dist --no-interaction

# Build frontend assets if package.json exists (optional)
RUN if [ -f package.json ]; then npm ci && npm run build; fi

# Set correct permissions for Laravel storage and cache folders
RUN chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

# Laravel public directory (default for richarvey image)
ENV WEBROOT=/var/www/html/public

# Expose port 80
EXPOSE 80
