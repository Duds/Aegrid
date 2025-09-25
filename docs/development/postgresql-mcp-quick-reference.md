# PostgreSQL MCP Server - Quick Reference

## Cursor Configuration

**Server Name**: `Aegrid PostgreSQL`
**Type**: `stdio`
**Command**: `node`  
**Args**: `["/home/dale-rogers/.npm-global/lib/node_modules/mcp-server-postgresql/dist/mcp-server.js", "--stdio"]`

## Database Connection

- **Host**: localhost
- **Port**: 5432
- **Database**: aegrid
- **User**: postgres
- **Password**: postgres
- **SSL**: prefer

## Available Tools

### Schema Tools
- `list_tables` - List all database tables
- `describe_table` - Get table structure and details
- `list_columns` - Show table columns
- `get_table_constraints` - Get primary/foreign keys

### Query Tools
- `execute_query` - Run read-only SQL queries
- `explain_query` - Get query execution plan
- `get_query_result` - Retrieve query results

### Database Info
- `get_database_info` - General database information
- `list_schemas` - List all schemas
- `get_table_statistics` - Table stats and row counts

## Usage Examples

```
List all tables in the Aegrid database
Show me the Asset table structure
Query assets by type and condition
Explain the execution plan for WorkOrder queries
```

## Security

- **Read-only access only**
- No INSERT/UPDATE/DELETE operations
- Uses existing PostgreSQL credentials
- SSL preferred for connections

## Troubleshooting

- **Connection issues**: Check PostgreSQL is running
- **Permission denied**: Verify script is executable
- **Server not appearing**: Restart Cursor after configuration
