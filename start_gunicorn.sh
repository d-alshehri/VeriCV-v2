#!/bin/bash

# Exit on any error
set -e

# Change to the backend directory
cd /home/VeriCV/backend

# Activate virtual environment
source /home/VeriCV/venv/bin/activate

# Export environment variables
export DJANGO_SETTINGS_MODULE=core.settings

# Start Gunicorn with proper logging
exec gunicorn core.wsgi:application \
    --bind 127.0.0.1:8000 \
    --workers 3 \
    --timeout 120 \
    --access-logfile /var/log/vericv-access.log \
    --error-logfile /var/log/vericv-error.log \
    --log-level info \
    --capture-output \
    --enable-stdio-inheritance
