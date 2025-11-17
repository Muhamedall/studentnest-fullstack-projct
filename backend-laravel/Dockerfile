FROM richarvey/nginx-php-fpm:3.1.6

RUN apt-get update && apt-get install -y supervisor

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader --prefer-dist --no-interaction

RUN if [ -f package.json ]; then npm ci && npm run build; fi

RUN chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

ENV WEBROOT=/var/www/html/public

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
