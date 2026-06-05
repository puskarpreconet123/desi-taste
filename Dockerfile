# Use the official PHP 8.2 Apache production-ready image
FROM php:8.2-apache

# Set metadata labels
LABEL maintainer="Desi Taste <desitaste363@gmail.com>"
LABEL description="Docker image for the Desi Taste PHP/HTML website"

# Prevent Apache server name warning
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Install system dependencies for common PHP extensions and utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpng-dev \
    libjpeg-dev \
    libwebp-dev \
    libfreetype6-dev \
    zip \
    unzip \
    msmtp \
    && rm -rf /var/lib/apt/lists/*

# Configure and install PHP extensions
# gd: for image handling (gallery features, etc.)
# opcache: for optimal PHP performance
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) gd opcache

# Enable Apache mod_rewrite for friendly URL structures
RUN a2enmod rewrite

# Use the default production configuration
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Apply custom PHP configurations via custom.ini
RUN { \
        echo 'opcache.memory_consumption=128'; \
        echo 'opcache.interned_strings_buffer=8'; \
        echo 'opcache.max_accelerated_files=4000'; \
        echo 'opcache.revalidate_freq=60'; \
        echo 'opcache.fast_shutdown=1'; \
        echo 'upload_max_filesize=64M'; \
        echo 'post_max_size=64M'; \
        echo 'memory_limit=256M'; \
        echo 'date.timezone=Europe/Berlin'; \
    } > "$PHP_INI_DIR/conf.d/custom.ini"

# Set the working directory to Apache's default public folder
WORKDIR /var/www/html

# Copy all application files to the container
# (.dockerignore ensures files like Dockerfile and .git are skipped)
COPY . /var/www/html/

# Set correct permissions: Apache runs as www-data user/group
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Expose port 80 for web traffic
EXPOSE 80

# Start Apache in the foreground
CMD ["apache2-foreground"]
