# Aegrid Prisma MCP Server

## Overview
A custom Model Context Protocol (MCP) server that provides Prisma-specific tools for managing your Aegrid database schema and executing read-only queries.

## Features
- **Schema Analysis**: Inspect Prisma models, fields, and relationships
- **Safe Queries**: Execute read-only Prisma operations with built-in safety limits
- **Relationship Mapping**: Understand model relationships and foreign keys
- **Database Status**: Check connection and basic database information

## Available Tools

### 1. `prisma_schema_info`
Get comprehensive information about your Prisma schema including all models and enums.

**Usage**: "Show me the Prisma schema information"

### 2. `prisma_model_info`
Get detailed information about a specific Prisma model including all fields and their types.

**Usage**: "Show me the Asset model structure"

### 3. `prisma_query`
Execute read-only Prisma queries with safety limits (max 100 results).

**Supported Operations**:
- `findMany` - Get multiple records
- `findFirst` - Get first matching record
- `count` - Count records
- `aggregate` - Aggregate operations

**Usage**:
- "Find all assets with critical condition"
- "Count work orders by status"
- "Get the first user with admin role"

### 4. `prisma_relationships`
Analyze relationships between Prisma models including direct relations and foreign keys.

**Usage**: "Show me the relationships for the Asset model"

### 5. `prisma_database_status`
Check database connection status and get basic database information.

**Usage**: "Check the database connection status"

## Configuration

**Server Name**: `Aegrid Prisma`
**Command**: `node`
**Args**: `["/home/dale-rogers/Projects/active/personal/Aegrid/scripts/prisma-mcp-server.js"]`
**Environment**: `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aegrid`

## Safety Features

- **Read-Only Operations**: Only allows safe read operations
- **Result Limiting**: Automatically limits results to prevent performance issues
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Connection Management**: Proper Prisma client lifecycle management

## Usage Examples

### Schema Exploration
```
Show me all models in the Prisma schema
What fields does the WorkOrder model have?
Analyze the relationships for the Asset model
```

### Data Queries
```
Find all assets with condition 'CRITICAL'
Count work orders by status
Get the first 10 users with manager role
Show me work orders assigned to a specific user
```

### Database Management
```
Check if the database is connected
Show me database version information
Verify Prisma client is working
```

## Integration with Aegrid

This Prisma MCP server is specifically designed for your Aegrid project and provides:

- **Asset Management**: Query and analyze asset data
- **Work Order Tracking**: Monitor work order status and assignments
- **User Management**: Analyze user roles and permissions
- **Relationship Analysis**: Understand complex model relationships
- **Schema Documentation**: Generate schema documentation on demand

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Verify PostgreSQL is running
   - Check DATABASE_URL environment variable
   - Ensure Prisma client is properly configured

2. **Model Not Found**
   - Verify model name spelling (case-sensitive)
   - Check if model exists in schema.prisma
   - Ensure Prisma client is generated

3. **Query Errors**
   - Only read operations are allowed
   - Check query parameters format
   - Verify model field names

### Testing the Server

Test the Prisma MCP server manually:
```bash
cd /home/dale-rogers/Projects/active/personal/Aegrid
node scripts/prisma-mcp-server.js
```

## Related Documentation

- [PostgreSQL MCP Server Setup](./postgresql-mcp-setup.md)
- [Aegrid Database Schema](../prisma/schema.prisma)
- [The Aegrid Rules](../core/aegrid-rules.md)

