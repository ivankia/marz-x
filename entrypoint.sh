#!/bin/sh
set -e

# 1. Wait for postgres and run migrations
echo "Running database migrations..."
until npx prisma migrate deploy; do
  echo "Database not ready, retrying in 3s..."
  sleep 3
done

# 2. Start Backend (Node)
echo "Starting Backend..."
node src/index.js &

# 3. Start Frontend Server (Nginx)
echo "Starting Nginx..."
exec nginx -g 'daemon off;'
