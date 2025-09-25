# PostgreSQL MCP Server Setup Guide for Aegrid

## Overview
This guide will help you configure the PostgreSQL MCP server in Cursor to provide read-only access to your Aegrid database schema and execute queries.

## Prerequisites
- PostgreSQL MCP server package installed globally (`mcp-server-postgresql`)
- PostgreSQL database running with Aegrid schema
- Cursor IDE with MCP support

## Installation Steps

### 1. Install PostgreSQL MCP Server
```bash
npm install -g mcp-server-postgresql
```

### 2. Configure Cursor MCP Settings

1. **Open Cursor Settings**
   - Navigate to `Cursor Settings > Features > MCP`
   - Click the "+ Add New MCP Server" button

2. **Configure the Server**
   - **Name**: `Aegrid PostgreSQL`
   - **Type**: `stdio`
   - **Command**: `node`
   - **Args**: `["/home/dale-rogers/.npm-global/lib/node_modules/mcp-server-postgresql/dist/mcp-server.js", "--stdio"]`

### 3. Database Connection Details

The MCP server will connect to your PostgreSQL database using these settings:
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `aegrid`
- **Username**: `postgres`
- **Password**: `postgres`
- **SSL Mode**: `prefer`

### 4. Available MCP Tools

Once configured, the PostgreSQL MCP server provides these tools:

#### Schema Inspection Tools
- **`list_tables`**: List all tables in the database
- **`describe_table`**: Get detailed information about a specific table
- **`list_columns`**: List columns for a specific table
- **`get_table_constraints`**: Get constraints (primary keys, foreign keys, etc.)

#### Query Execution Tools
- **`execute_query`**: Execute read-only SQL queries
- **`explain_query`**: Get query execution plan
- **`get_query_result`**: Get results from a previously executed query

#### Database Information Tools
- **`get_database_info`**: Get general database information
- **`list_schemas`**: List all schemas in the database
- **`get_table_statistics`**: Get table statistics and row counts

## Usage Examples

### Schema Exploration
```
List all tables in the Aegrid database
```

### Asset Analysis
```
Show me the structure of the Asset table and its relationships
```

### Data Queries
```
Query the Asset table to show assets by type and condition
```

### Performance Analysis
```
Explain the execution plan for a complex query on WorkOrder and Asset tables
```

## Security Considerations

- The MCP server provides **read-only access** to your database
- No write operations (INSERT, UPDATE, DELETE) are allowed
- Connection uses your existing PostgreSQL credentials
- SSL is preferred for secure connections

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Verify PostgreSQL is running: `pg_isready -h localhost -p 5432`
   - Check database credentials in the script
   - Ensure the database `aegrid` exists

2. **Permission Denied**
   - Make sure the script is executable: `chmod +x scripts/mcp-postgresql-server.sh`
   - Verify the script path in Cursor settings

3. **MCP Server Not Appearing**
   - Restart Cursor after adding the MCP server
   - Check the Cursor logs for any error messages
   - Verify the command path is correct

### Testing the Connection

Test the MCP server manually:
```bash
cd /home/dale-rogers/Projects/active/personal/Aegrid
./scripts/mcp-postgresql-server.sh
```

## Integration with Aegrid Development

The PostgreSQL MCP server will be particularly useful for:

- **Schema Analysis**: Understanding table relationships and constraints
- **Data Exploration**: Querying asset data, work orders, and user information
- **Performance Monitoring**: Analyzing query execution plans
- **Compliance Verification**: Checking data integrity and relationships
- **Testing Support**: Validating database state during development

## Next Steps

1. Configure the MCP server in Cursor using the settings above
2. Test the connection by asking the AI to list tables
3. Explore your Aegrid schema using natural language queries
4. Use the MCP tools to analyze your asset data and relationships

## Related Documentation

- [Aegrid Database Schema](../prisma/schema.prisma)
- [Database Architecture](../docs/architecture/hybrid-database-strategy.md)
- [The Aegrid Rules](../docs/core/aegrid-rules.md)
