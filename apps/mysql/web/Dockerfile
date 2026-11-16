ARG REGISTRY=
FROM ${REGISTRY}php:8.2-apache
RUN docker-php-ext-install mysqli \
 && printf 'display_errors=Off\nlog_errors=On\n' > /usr/local/etc/php/conf.d/lab.ini
COPY src/ /var/www/html/
EXPOSE 80
