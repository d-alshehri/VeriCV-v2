"""
Django settings for core project.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta
import dj_database_url  # make sure it's installed

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables
load_dotenv("/home/VeriCV/backend/.env")

# Basic setup
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key")
DEBUG = os.getenv("DEBUG", "True") == "True"
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "*").split(",")

# Installed apps
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "users",
    "cv",
    "feedback",
    "quiz",
    "ai",
    "assessment",
    "matcher",
    "core",
    "healthcheck",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"

# Local: SQLite | Server: PostgreSQL
USE_SQLITE = os.getenv("USE_SQLITE", "1") == "1"

if USE_SQLITE:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
else:
    SUPABASE_DB_URL = os.getenv("SUPABASE_POSTGRES_URL_NON_POOLING") or os.getenv("SUPABASE_POSTGRES_URL")
    if SUPABASE_DB_URL:
        DATABASES = {
            "default": dj_database_url.config(
                default=SUPABASE_DB_URL,
                conn_max_age=600,
                conn_health_checks=True,
            )
        }
        DATABASES["default"]["OPTIONS"] = {**DATABASES["default"].get("OPTIONS", {}), "sslmode": "require"}
    else:
        DATABASES = {
            "default": {
                "ENGINE": "django.db.backends.postgresql",
                "NAME": os.getenv("SUPABASE_POSTGRES_DATABASE") or os.getenv("DB_NAME", "django"),
                "USER": os.getenv("SUPABASE_POSTGRES_USER") or os.getenv("DB_USER", "django"),
                "PASSWORD": os.getenv("SUPABASE_POSTGRES_PASSWORD") or os.getenv("DB_PASSWORD", ""),
                "HOST": os.getenv("SUPABASE_POSTGRES_HOST") or os.getenv("DB_HOST", "localhost"),
                "PORT": os.getenv("DB_PORT", "5432"),
                "OPTIONS": {
                    **({"sslmode": "require"} if os.getenv("DB_SSLMODE") == "require" else {})
                },
            }
        }

print("Using database engine:", DATABASES["default"]["ENGINE"])
