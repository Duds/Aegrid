# Integrations

This directory contains documentation and configuration for external integrations with the Aegrid platform.

## Available Integrations

### Model Context Protocol (MCP) Servers

Aegrid is integrated with multiple MCP servers to enhance development capabilities within Cursor IDE.

**Quick Start:**
```bash
# Run the automated setup script
./scripts/setup-mcp-env.sh

# Or manually configure
cp config/mcp-env.example ~/.mcp-env
# Edit ~/.mcp-env with your credentials
source ~/.zshrc  # or ~/.bashrc
```

**Configured MCP Servers:**

1. **GitHub** - Repository management, issues, and PRs
   - Package: `@modelcontextprotocol/server-github`
   - Requires: `GITHUB_PERSONAL_ACCESS_TOKEN`
   - Status: ✅ Verified (v2025.4.8)

2. **Context7** - Enhanced code context and navigation
   - Package: `@upstash/context7-mcp`
   - Status: ✅ Verified (v1.0.20)

3. **Playwright** - Browser automation and testing
   - Package: `@playwright/mcp@latest`
   - Status: ✅ Verified

4. **Chrome DevTools** - Browser debugging and inspection
   - Package: `chrome-devtools-mcp@latest`
   - Status: ✅ Verified

5. **File System** - Local file system access
   - Package: `@modelcontextprotocol/server-filesystem`
   - Configured for: `/Users/dalerogers/Projects/Aegrid`
   - Status: ✅ Verified (v2025.8.21)

6. **Azure** - Azure cloud services integration
   - Package: `@azure/mcp`
   - Requires: `AZURE_SUBSCRIPTION_ID`, `AZURE_TENANT_ID`
   - Status: ✅ Verified (v0.8.3)

7. **PostgreSQL** - Direct database access
   - Package: `@henkey/postgres-mcp-server`
   - Requires: `POSTGRES_MCP_CONNECTION_STRING`
   - Status: ✅ Verified

**Note:** MindsDB and TaskMaster MCP servers are not currently available as npm packages. Use the MindsDB SDK directly or alternative task management tools if needed.

**Documentation:**
- [MCP Servers Setup Guide](./mcp-servers-setup.md) - Detailed setup instructions
- [MCP Client Configuration Example](./mcp-client.config.example.json) - Configuration reference

**Configuration Files:**
- `~/.cursor/mcp.json` - Active MCP configuration (user-specific)
- `config/mcp-env.example` - Environment variables template
- `docs/integrations/mcp-client.config.example.json` - Configuration reference

### PostgreSQL Database

Aegrid uses PostgreSQL with PostGIS extension for spatial data.

**Connection Configuration:**
```bash
# Development database
postgresql://username:password@localhost:5432/aegrid_dev

# Production database (Azure)
See environment variables in deployment documentation
```

**Related Files:**
- `prisma/schema.prisma` - Database schema definition
- `docs/database/` - Database architecture and design docs

### Azure Services

Aegrid integrates with multiple Azure services:

- **Azure Container Apps** - Application hosting
- **Azure Cosmos DB** - Graph database (Gremlin API)
- **Azure Application Insights** - Monitoring and analytics
- **Azure Key Vault** - Secrets management

**Documentation:**
- `infra/azure-container-apps/` - Infrastructure as Code
- `docs/architecture/hybrid-database-strategy.md` - Database architecture

### External APIs

Aegrid integrates with various external APIs:

- **Weather APIs** - Asset condition monitoring
- **Mapping Services** - Geospatial visualisation
- **OAuth Providers** - Authentication services

## Adding New Integrations

When adding new integrations to Aegrid:

1. **Create Documentation**
   - Add integration guide to this directory
   - Document configuration requirements
   - Include example configurations

2. **Update Configuration**
   - Add environment variable templates
   - Update deployment scripts
   - Document security requirements

3. **Security Review**
   - Never commit credentials to git
   - Use environment variables for secrets
   - Follow principle of least privilege
   - Document required permissions

4. **Testing**
   - Add integration tests
   - Document testing procedures
   - Verify error handling

## Security Best Practices

⚠️ **Critical Security Requirements:**

1. **Credentials Management**
   - Use environment variables for all credentials
   - Never commit secrets to git
   - Rotate tokens and keys regularly
   - Use Azure Key Vault for production

2. **Access Control**
   - Use principle of least privilege
   - Limit API token scopes
   - Implement role-based access control
   - Monitor API usage and access logs

3. **Network Security**
   - Use HTTPS for all external connections
   - Implement rate limiting
   - Monitor for suspicious activity
   - Keep dependencies updated

## Support

For integration issues:

1. Check integration-specific documentation in this directory
2. Review logs in Cursor IDE (Help → Toggle Developer Tools)
3. Verify environment variables are properly set
4. Consult the main project documentation

## Related Documentation

- [System Architecture Document](../architecture/SAD.md)
- [Development Guidelines](../development/developer-brief.md)
- [Security Standards](../security/rbac-implementation.md)
- [Database Documentation](../database/)

---

**Last Updated:** 1 October 2024
**Maintained By:** Aegrid Development Team
