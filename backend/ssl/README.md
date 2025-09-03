# SSL Certificates Directory

Place your SSL certificates here:

- your-domain.crt (SSL certificate)
- your-domain.key (SSL private key)
- intermediate.crt (Intermediate certificate if required)

## Auto-renewal with Let's Encrypt

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Generate certificates
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./your-domain.crt
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./your-domain.key

# Set proper permissions
sudo chmod 600 ./your-domain.key
sudo chown nginx:nginx ./your-domain.crt ./your-domain.key
```

## Automatic Renewal

```bash
# Add to crontab
sudo crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet --post-hook "nginx -s reload"
```
