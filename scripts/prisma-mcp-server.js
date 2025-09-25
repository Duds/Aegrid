#!/usr/bin/env node

/**
 * Prisma MCP Server for Aegrid
 * A custom MCP server that provides Prisma-specific tools for database management
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Create MCP Server
const server = new Server(
  {
    name: 'aegrid-prisma-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'prisma_schema_info',
        description: 'Get information about the Prisma schema including models, fields, and relationships',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'prisma_model_info',
        description: 'Get detailed information about a specific Prisma model',
        inputSchema: {
          type: 'object',
          properties: {
            model: {
              type: 'string',
              description: 'Name of the Prisma model to inspect',
            },
          },
          required: ['model'],
        },
      },
      {
        name: 'prisma_query',
        description: 'Execute a Prisma query (read-only operations only)',
        inputSchema: {
          type: 'object',
          properties: {
            model: {
              type: 'string',
              description: 'Name of the Prisma model to query',
            },
            operation: {
              type: 'string',
              enum: ['findMany', 'findFirst', 'count', 'aggregate'],
              description: 'Type of Prisma operation to perform',
            },
            where: {
              type: 'object',
              description: 'Where clause for filtering (JSON object)',
            },
            take: {
              type: 'number',
              description: 'Limit number of results (max 100)',
              maximum: 100,
            },
          },
          required: ['model', 'operation'],
        },
      },
      {
        name: 'prisma_relationships',
        description: 'Get relationship information between Prisma models',
        inputSchema: {
          type: 'object',
          properties: {
            model: {
              type: 'string',
              description: 'Name of the Prisma model to analyze relationships for',
            },
          },
          required: ['model'],
        },
      },
      {
        name: 'prisma_database_status',
        description: 'Check database connection status and basic info',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'prisma_schema_info': {
        const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma');
        const schemaContent = readFileSync(schemaPath, 'utf-8');

        // Parse basic schema info
        const models = schemaContent.match(/model\s+(\w+)\s*{[\s\S]*?}/g) || [];
        const enums = schemaContent.match(/enum\s+(\w+)\s*{[\s\S]*?}/g) || [];

        return {
          content: [
            {
              type: 'text',
              text: `# Prisma Schema Information

## Models (${models.length})
${models.map(m => {
  const modelName = m.match(/model\s+(\w+)/)?.[1];
  return `- ${modelName}`;
}).join('\n')}

## Enums (${enums.length})
${enums.map(e => {
  const enumName = e.match(/enum\s+(\w+)/)?.[1];
  return `- ${enumName}`;
}).join('\n')}

## Schema Location
${schemaPath}

## Database Provider
PostgreSQL with PostGIS extensions`,
            },
          ],
        };
      }

      case 'prisma_model_info': {
        const { model } = args;
        const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma');
        const schemaContent = readFileSync(schemaPath, 'utf-8');

        // Find the specific model
        const modelRegex = new RegExp(`model\\s+${model}\\s*{[\\s\\S]*?}`, 'g');
        const modelMatch = schemaContent.match(modelRegex);

        if (!modelMatch) {
          return {
            content: [
              {
                type: 'text',
                text: `Model '${model}' not found in schema.`,
              },
            ],
          };
        }

        const modelContent = modelMatch[0];
        const fields = modelContent.match(/\s+(\w+)\s+(\w+)([^;]*);/g) || [];

        return {
          content: [
            {
              type: 'text',
              text: `# Model: ${model}

## Fields
${fields.map(field => {
  const parts = field.trim().split(/\s+/);
  const fieldName = parts[0];
  const fieldType = parts[1];
  const attributes = parts.slice(2).join(' ');
  return `- **${fieldName}**: ${fieldType}${attributes ? ` ${attributes}` : ''}`;
}).join('\n')}

## Full Model Definition
\`\`\`prisma
${modelContent}
\`\`\``,
            },
          ],
        };
      }

      case 'prisma_query': {
        const { model, operation, where, take = 10 } = args;

        // Safety check - only allow read operations
        if (!['findMany', 'findFirst', 'count', 'aggregate'].includes(operation)) {
          throw new Error('Only read operations are allowed');
        }

        // Limit results
        const limit = Math.min(take, 100);

        let result;
        const queryOptions = {};

        if (where) {
          queryOptions.where = where;
        }

        if (operation === 'findMany' || operation === 'findFirst') {
          queryOptions.take = limit;
        }

        // Execute the query
        const modelClient = prisma[model.toLowerCase()];
        if (!modelClient) {
          throw new Error(`Model '${model}' not found in Prisma client`);
        }

        result = await modelClient[operation](queryOptions);

        return {
          content: [
            {
              type: 'text',
              text: `# Query Result: ${model}.${operation}

## Parameters
- Model: ${model}
- Operation: ${operation}
- Where: ${where ? JSON.stringify(where, null, 2) : 'None'}
- Limit: ${limit}

## Result
\`\`\`json
${JSON.stringify(result, null, 2)}
\`\`\``,
            },
          ],
        };
      }

      case 'prisma_relationships': {
        const { model } = args;
        const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma');
        const schemaContent = readFileSync(schemaPath, 'utf-8');

        // Find relationships for the model
        const modelRegex = new RegExp(`model\\s+${model}\\s*{[\\s\\S]*?}`, 'g');
        const modelMatch = schemaContent.match(modelRegex);

        if (!modelMatch) {
          return {
            content: [
              {
                type: 'text',
                text: `Model '${model}' not found in schema.`,
              },
            ],
          };
        }

        const modelContent = modelMatch[0];
        const relations = modelContent.match(/\s+(\w+)\s+(\w+)\s+@relation[^;]*;/g) || [];
        const foreignKeys = modelContent.match(/\s+(\w+)\s+(\w+)\?[^;]*;/g) || [];

        return {
          content: [
            {
              type: 'text',
              text: `# Relationships for Model: ${model}

## Direct Relations
${relations.map(rel => {
  const parts = rel.trim().split(/\s+/);
  const fieldName = parts[0];
  const fieldType = parts[1];
  return `- **${fieldName}**: ${fieldType} (relation)`;
}).join('\n')}

## Foreign Key Fields
${foreignKeys.map(fk => {
  const parts = fk.trim().split(/\s+/);
  const fieldName = parts[0];
  const fieldType = parts[1];
  return `- **${fieldName}**: ${fieldType} (foreign key)`;
}).join('\n')}`,
            },
          ],
        };
      }

      case 'prisma_database_status': {
        try {
          // Test database connection
          await prisma.$queryRaw`SELECT 1`;

          // Get basic database info
          const dbVersion = await prisma.$queryRaw`SELECT version()`;
          const tableCount = await prisma.$queryRaw`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = 'public'
          `;

          return {
            content: [
              {
                type: 'text',
                text: `# Database Status

## Connection
✅ **Connected** to Aegrid PostgreSQL database

## Database Information
- **Version**: ${JSON.stringify(dbVersion)}
- **Tables**: ${JSON.stringify(tableCount)}

## Prisma Client
✅ **Initialized** and ready for queries`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `# Database Status

❌ **Connection Failed**: ${error instanceof Error ? error.message : 'Unknown error'}

Please check your database connection and Prisma configuration.`,
              },
            ],
          };
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Aegrid Prisma MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Cleanup on exit
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
