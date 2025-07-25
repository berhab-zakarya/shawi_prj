import os
from pathlib import Path
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-$_q)*y(1q3=%oq9&$uzlp%7awjpki-puni*xnmil(ad#5@et+g')

# Environment variables with fallback values


DEBUG = os.getenv('DJANGO_DEBUG', 'False').lower() == 'true'

# Database configuration from environment variables
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': os.getenv('POSTGRES_DB', 'elshawi_db'),
#         'USER': os.getenv('POSTGRES_USER', 'elshawi_user'),
#         'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'elshawi_pass'),
#         'HOST': os.getenv('POSTGRES_HOST', 'db'),
#         'PORT': os.getenv('POSTGRES_PORT', '5432'),
#     }
# }
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Redis configuration
REDIS_URL = os.getenv('REDIS_URL', 'redis://redis:6379/0')

# Security settings from environment variables
SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'False').lower() == 'true'
SECURE_HSTS_SECONDS = int(os.getenv('SECURE_HSTS_SECONDS', '31536000'))
SECURE_HSTS_INCLUDE_SUBDOMAINS = os.getenv('SECURE_HSTS_INCLUDE_SUBDOMAINS', 'True').lower() == 'true'
SECURE_HSTS_PRELOAD = os.getenv('SECURE_HSTS_PRELOAD', 'True').lower() == 'true'

# Timezone settings
TIME_ZONE = os.getenv('TIME_ZONE', 'UTC')
USE_TZ = os.getenv('USE_TZ', 'True').lower() == 'true'

ALLOWED_HOSTS = ["*"]
CORS_ALLOW_ALL_ORIGINS = True

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:8000",
    "http://localhost:8001",
    "http://127.0.0.1:8001",
        "https://elshawi-backend-66.westeurope.azurecontainer.io",
    "https://elshawi-frontend-66.westeurope.azurecontainer.io",

]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://localhost:8001",
    "ws://localhost:8001",
    "ws://127.0.0.1:8001",
    "https://eilflawyers.com",
    "http://eilflawyers.com",
    "https://31.97.182.92",
    "http://31.97.182.92",

        "https://elshawi-backend-66.westeurope.azurecontainer.io",
    "https://elshawi-frontend-66.westeurope.azurecontainer.io",
]

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://elshawi-(backend|frontend)-66\.westeurope\.azurecontainer\.io$",
]

# Application definition
INSTALLED_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework.authtoken',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'accounts.apps.AccountsConfig',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'taggit',
    'django_filters',
    'django_ckeditor_5',
    'notifications',
    'documents',
    'contracts',
    'marketplace',
    'channels',
    'ai_assistant',
    'chat',
    'content',
    'invoices'
]

DJANGO_CKEDITOR_5_CONFIGS = {
    'default': {
        'toolbar': ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote'],
        'height': 300,
        'width': '100%',
    },
}

SESSION_ENGINE = 'django.contrib.sessions.backends.db'

MIDDLEWARE = [
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'elshawi_backend.dsrf.DisableCSRFForJWT',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'elshawi_backend.urls'
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'elshawi_backend.wsgi.application'
ASGI_APPLICATION = 'elshawi_backend.asgi.application'
AUTH_USER_MODEL = 'accounts.User'

from corsheaders.defaults import default_headers
CORS_ALLOW_HEADERS = list(default_headers) + [
    'x-is-private-api',
]

# REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
    'rest_framework_simplejwt.authentication.JWTAuthentication',
    # 'rest_framework.authentication.TokenAuthentication',
    # 'rest_framework.authentication.SessionAuthentication',
],

    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend'], 
}

# Simple JWT configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
USE_I18N = True

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = '/app/staticfiles'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Email settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = "studxptm@gmail.com"
EMAIL_HOST_PASSWORD = "tcklurubvkjttqhi"
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# Celery configuration
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL

CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

# Channels configuration
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [REDIS_URL],
        },
    },
}

# File upload settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB

# Notification settings
NOTIFICATION_SETTINGS = {
    'DEFAULT_PRIORITY': 'medium',
    'RETENTION_DAYS': 30,
    'BATCH_SIZE': 20,
}

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'celery': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# OpenRouter API Key
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY', 'sk-or-v1-57dfa6e2df9e6bee75c634ad90dba30b5bcfb9fd04')