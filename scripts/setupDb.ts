// For local development:

// DATABASE_URL="postgresql://tp1_user:tp1_user_password@localhost:5432/tpdb?schema=public"
// SHADOW_DATABASE_URL="postgresql://tp1_user:tp1_user_password@localhost:5432/shadow_tpdb?schema=public"

// psql -U postgres -c "CREATE DATABASE tpdb;"
// psql -U postgres -c "CREATE DATABASE shadow_tpdb;"
// psql -U postgres -c "CREATE USER tp1_user WITH PASSWORD 'tp1_user_password';"

// psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE tpdb TO tp1_user;"
// psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE shadow_tpdb TO tp1_user;"

// psql -U postgres -d tpdb -c "GRANT ALL PRIVILEGES ON SCHEMA public TO tp1_user;"
// psql -U postgres -d shadow_tpdb -c "GRANT ALL PRIVILEGES ON SCHEMA public TO tp1_user;"
