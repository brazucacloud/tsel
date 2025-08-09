-- Script para corrigir permissões do PostgreSQL
-- Execute como usuário postgres: sudo -u postgres psql -f scripts/fix-postgres-permissions.sql

-- Garantir que o banco tsel_db existe
CREATE DATABASE tsel_db;

-- Garantir que o usuário tsel_user existe
CREATE USER tsel_user WITH PASSWORD 'tsel_password';

-- Conceder todas as permissões no banco tsel_db
GRANT ALL PRIVILEGES ON DATABASE tsel_db TO tsel_user;
ALTER USER tsel_user CREATEDB;

-- Conectar ao banco tsel_db
\c tsel_db

-- Conceder permissões no schema public
GRANT ALL ON SCHEMA public TO tsel_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tsel_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tsel_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO tsel_user;

-- Configurar permissões padrão para futuras tabelas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO tsel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO tsel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO tsel_user;

-- Dar permissão para criar tabelas
GRANT CREATE ON SCHEMA public TO tsel_user;

-- Verificar permissões
\du tsel_user
