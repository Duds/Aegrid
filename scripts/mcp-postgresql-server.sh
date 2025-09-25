#!/bin/bash

# PostgreSQL MCP Server Configuration Script for Aegrid
# This script sets up the PostgreSQL MCP server with proper environment variables

# Set the database connection details
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aegrid"
export PGHOST="localhost"
export PGPORT="5432"
export PGDATABASE="aegrid"
export PGUSER="postgres"
export PGPASSWORD="postgres"

# Set SSL mode (adjust based on your PostgreSQL configuration)
export PGSSLMODE="prefer"

# Set connection timeout
export PG_TIMEOUT="30"

# Set maximum connections
export PG_MAX_CONNECTIONS="10"

# Run the PostgreSQL MCP server
exec node /home/dale-rogers/.npm-global/lib/node_modules/mcp-server-postgresql/dist/mcp-server.js
