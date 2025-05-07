#!/bin/bash
set -e

echo "Running migrations..."
npx prisma migrate deploy

echo "Starting application..."
exec npm run start:prod