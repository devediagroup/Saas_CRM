# 🐳 Dockerfile for EchoOps CRM Frontend - Production Ready
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --quiet

# Copy source code
COPY . .

# Build the application for production
RUN npm run build

# Production stage with optimized Nginx
FROM nginx:alpine AS production

# Install necessary packages
RUN apk add --no-cache curl

# Remove default nginx configuration
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/*

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy optimized nginx configuration
COPY docker-nginx.conf /etc/nginx/nginx.conf

# Create proper directory structure
RUN mkdir -p /var/cache/nginx/client_temp /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx

# Switch to nginx user
USER nginx

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
