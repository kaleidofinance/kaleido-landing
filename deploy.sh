#!/bin/bash

# Exit on error
set -e

echo "Starting deployment..."

# making deploy.sh executable
echo "Making deploy.sh executable..."
chmod +x deploy.sh

# Prompt the user for the branch name
read -p "Enter the branch name to deploy: " branch

# Confirm the branch selection
read -p "You entered '$branch'. Do you want to proceed? (yes/no): " confirm

if [[ "$confirm" == "yes" ]]; then
    echo "Resetting local changes..."
    git reset --hard HEAD
    git clean -fd  # Remove untracked files

    echo "Pulling latest changes from branch '$branch'..."

    # Fetch all changes from the remote
    git fetch origin

    # Ensure the local branch is up-to-date with the remote branch
    git checkout "$branch"
    git reset --hard origin/"$branch"

    echo "Deployment from branch '$branch' completed!"
else
    echo "Deployment aborted!"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
NODE_ENV=production npm run build

# Create standalone directory if it doesn't exist
echo "Setting up standalone directory..."
mkdir -p .next/standalone

# Copy static and public assets
echo "Copying static assets..."
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

# Copy environment variables
echo "Copying environment variables..."
if [ -f .env.local ]; then
    cp .env.local .next/standalone/.env
else
    echo "Warning: .env.local not found. Make sure environment variables are set in production."
fi

# Set correct permissions
echo "Setting permissions..."
chmod -R 755 .next/standalone

# Stop existing PM2 process if it exists
echo "Stopping existing PM2 process..."
pm2 stop kalaido 2>/dev/null || true
pm2 delete kalaido 2>/dev/null || true

# Start PM2 with ecosystem config
echo "Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 process list
echo "Saving PM2 process list..."
pm2 save

echo "Deployment completed successfully!"

# Show PM2 status
pm2 status
