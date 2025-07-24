# 🚀 Azure Production Stage - Optimized for Container Instances
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install system dependencies (cached layer)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpango-1.0-0 \
    libcairo2 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    libglib2.0-0 \
    libpangocairo-1.0-0 \
    fonts-liberation \
    fonts-dejavu \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for better caching)
COPY requirements.txt ./

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Create non-root user
RUN useradd --create-home --shell /bin/bash app

# Create directories and set permissions
RUN mkdir -p /app/staticfiles /app/media /app/logs && \
    chown -R app:app /app

# Copy application code
COPY --chown=app:app . .

# Create SQLite database file with proper permissions
RUN touch db.sqlite3 && chown app:app db.sqlite3

# Switch to app user
USER app

# Collect static files
RUN python manage.py collectstatic --noinput || true

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/api/health/ || exit 1

# Start command
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn elshawi_backend.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120 --access-logfile - --error-logfile - --log-level info"]