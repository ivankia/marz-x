SELECT 'CREATE DATABASE marzx_site' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'marzx_site')\gexec
SELECT 'CREATE DATABASE marzx_dashboard' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'marzx_dashboard')\gexec
