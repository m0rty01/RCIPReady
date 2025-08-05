#!/bin/bash

# Exit on error
set -e

# Configuration
APP_NAME="rcip-ready"
DOMAIN="rcipready.ravijha.co"
DEPLOY_PATH="/var/www/$DOMAIN"
REPO_PATH="/home/m0rty/Documents/Projects/rcip-ready"

# Build the application
echo "Building application..."
cd $REPO_PATH
npm install
npm run build

# Create deployment directory
echo "Creating deployment directory..."
sudo mkdir -p $DEPLOY_PATH
sudo chown -R $USER:$USER $DEPLOY_PATH

# Copy built application
echo "Copying built application..."
cp -r .next $DEPLOY_PATH/
cp -r public $DEPLOY_PATH/
cp package.json $DEPLOY_PATH/
cp package-lock.json $DEPLOY_PATH/
cp next.config.js $DEPLOY_PATH/

# Install production dependencies
echo "Installing production dependencies..."
cd $DEPLOY_PATH
npm install --production

# Set up environment variables
echo "Setting up environment variables..."
cp $REPO_PATH/.env.production $DEPLOY_PATH/.env

# Set up systemd service
echo "Setting up systemd service..."
sudo tee /etc/systemd/system/$APP_NAME.service << EOF
[Unit]
Description=RCIP Ready Next.js Application
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$DEPLOY_PATH
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=$(which npm) start
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Set up Nginx
echo "Setting up Nginx..."
sudo cp $REPO_PATH/nginx.conf /etc/nginx/sites-available/$DOMAIN
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN

# Set up SSL certificate
echo "Setting up SSL certificate..."
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email your-email@example.com

# Restart services
echo "Restarting services..."
sudo systemctl daemon-reload
sudo systemctl enable $APP_NAME
sudo systemctl restart $APP_NAME
sudo systemctl restart nginx

echo "Deployment completed successfully!"