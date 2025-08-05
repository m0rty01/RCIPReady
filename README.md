# RCIP Ready - Deployment Guide

This guide provides detailed instructions for deploying the RCIP Ready application to a production environment. The application is built with Next.js and requires Node.js, Nginx, and PostgreSQL.

## Prerequisites

- Ubuntu/Debian server (recommended)
- Node.js 18+ and npm
- Nginx
- PostgreSQL
- Domain name with DNS configured
- SSL certificate (we'll use Let's Encrypt)
- Git

## System Requirements

- RAM: Minimum 2GB (4GB recommended)
- CPU: 2 cores minimum
- Storage: 20GB minimum

## Environment Setup

1. Install required packages:
```bash
sudo apt update
sudo apt install -y nodejs npm nginx postgresql certbot python3-certbot-nginx
```

2. Clone the repository:
```bash
git clone [your-repo-url]
cd rcip-ready
```

3. Create environment file:
```bash
cp .env.example .env.production
```

Edit `.env.production` with your production values:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/rcip_ready"
OPENAI_API_KEY="your-openai-key"
# Add other required environment variables
```

## Database Setup

1. Create PostgreSQL database:
```bash
sudo -u postgres psql
CREATE DATABASE rcip_ready;
CREATE USER your_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE rcip_ready TO your_user;
\q
```

2. Run database migrations:
```bash
npx prisma migrate deploy
```

## Application Deployment

You can deploy the application using our automated deployment script:

```bash
chmod +x deploy.sh
./deploy.sh
```

The deployment script will:
1. Build the application
2. Set up the deployment directory
3. Install production dependencies
4. Configure environment variables
5. Set up systemd service
6. Configure Nginx
7. Set up SSL certificate
8. Restart all necessary services

### Manual Deployment Steps

If you prefer to deploy manually, follow these steps:

1. Build the application:
```bash
npm install
npm run build
```

2. Create deployment directory:
```bash
sudo mkdir -p /var/www/your-domain
sudo chown -R $USER:$USER /var/www/your-domain
```

3. Copy built application:
```bash
cp -r .next /var/www/your-domain/
cp -r public /var/www/your-domain/
cp package.json package-lock.json next.config.js /var/www/your-domain/
```

4. Install production dependencies:
```bash
cd /var/www/your-domain
npm install --production
```

## Nginx Configuration

The application uses Nginx as a reverse proxy. The configuration is already provided in `nginx.conf`. Key features:

- SSL/TLS configuration with modern security settings
- HTTP to HTTPS redirection
- WebSocket support for Next.js
- Static asset caching
- Proxy settings for the Next.js application

## SSL Certificate

The deployment script automatically sets up SSL using Let's Encrypt. If you need to set it up manually:

```bash
sudo certbot --nginx -d your-domain.com
```

## Service Management

The application runs as a systemd service. Common commands:

```bash
# Start the service
sudo systemctl start rcip-ready

# Stop the service
sudo systemctl stop rcip-ready

# Restart the service
sudo systemctl restart rcip-ready

# View logs
sudo journalctl -u rcip-ready
```

## Monitoring and Maintenance

1. Monitor application logs:
```bash
sudo journalctl -u rcip-ready -f
```

2. Monitor Nginx logs:
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

Common issues and solutions:

1. **502 Bad Gateway**
   - Check if the Node.js application is running
   - Verify port 3000 is not blocked
   - Check application logs for errors

2. **SSL Certificate Issues**
   - Ensure domain DNS is properly configured
   - Check certificate renewal status: `sudo certbot certificates`

3. **Database Connection Issues**
   - Verify PostgreSQL is running: `sudo systemctl status postgresql`
   - Check database connection string in .env file
   - Ensure database user has proper permissions

## Security Considerations

1. Enable firewall:
```bash
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

2. Regularly update dependencies:
```bash
npm audit
npm update
```

3. Keep system packages updated:
```bash
sudo apt update
sudo apt upgrade
```

## Backup Strategy

1. Database backup:
```bash
pg_dump -U your_user rcip_ready > backup.sql
```

2. Application backup:
```bash
tar -czf backup.tar.gz /var/www/your-domain
```

## Support

For issues and support:
- Create an issue in the repository
- Contact the development team
- Check the application logs for detailed error messages

## License

[Your License Information]