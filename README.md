# LOCOSORTEOS

Sistema de sorteos construido con Laravel + Inertia + React.

## Requisitos

- PHP 8.2+
- Composer 2+
- Node.js 18+
- MySQL 8+

## Instalacion rapida

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm run dev
```

## Testing (MySQL)

Este proyecto esta configurado para correr pruebas con una base de datos MySQL separada usando `.env.testing`.

Configuracion recomendada:

- `DB_CONNECTION=mysql`
- `DB_HOST=127.0.0.1`
- `DB_PORT=3306`
- `DB_DATABASE=sorteo_test`
- `DB_USERNAME=root`
- `DB_PASSWORD=`

Comandos utiles:

```bash
# Crear/limpiar esquema de testing
php artisan migrate:fresh --env=testing --force

# Ejecutar toda la suite
php artisan test

# Ejecutar una clase concreta
php artisan test --filter=AuthenticationTest
```

## Notas de seguridad operativa

- Usa siempre una base dedicada para tests (`sorteo_test`), nunca la base productiva.
- La aprobacion y anulacion de compras en admin usan transacciones para reducir inconsistencias de tickets.
