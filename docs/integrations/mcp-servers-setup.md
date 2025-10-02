# MCP Servers Setup Guide

This guide explains how to configure and use the MCP (Model Context Protocol) servers integrated with Cursor IDE for the Aegrid project.

## Installed MCP Servers

The following MCP servers have been configured in `~/.cursor/mcp.json`:

1. **GitHub** - Interact with GitHub repositories, issues, and pull requests
2. **Context7** - Enhanced context awareness for code navigation
3. **Playwright** - Browser automation and testing
4. **Chrome DevTools** - Browser debugging and inspection
5. **File System** - Local file system access (configured for Aegrid project directory)
6. **Azure** - Azure cloud services integration
7. **MindsDB** - AI/ML database integration
8. **TaskMaster** - Task management and automation
9. **PostgreSQL** - Direct PostgreSQL database access

## Environment Variables Required

Add the following environment variables to your shell configuration file (`~/.zshrc`, `~/.bashrc`, or `~/.zshenv`):

### GitHub MCP Server
```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="your_github_pat_here"
```

**To create a GitHub Personal Access Token:**
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `read:org`, `read:user`
4. Copy the token and add it to your environment variables

### Azure MCP Server
```bash
export AZURE_SUBSCRIPTION_ID="your_azure_subscription_id"
export AZURE_TENANT_ID="your_azure_tenant_id"
```

**To find your Azure credentials:**
1. Log in to Azure Portal
2. Navigate to Subscriptions → Select your subscription
3. Copy the Subscription ID and Tenant ID

### MindsDB MCP Server
```bash
export MINDSDB_API_KEY="your_mindsdb_api_key"
```

**To get MindsDB API key:**
1. Sign up or log in to [MindsDB Cloud](https://cloud.mindsdb.com)
2. Navigate to Settings → API Keys
3. Generate a new API key

### PostgreSQL MCP Server
```bash
export POSTGRES_MCP_CONNECTION_STRING="postgresql://username:password@localhost:5432/aegrid_dev"
```

**Note:** This should match your local Aegrid database connection string.

## Applying Environment Variables

After adding the environment variables to your shell configuration file:

```bash
# Reload your shell configuration
source ~/.zshrc  # or ~/.bashrc

# Verify the variables are set
echo $GITHUB_PERSONAL_ACCESS_TOKEN
echo $AZURE_SUBSCRIPTION_ID
```

## Testing MCP Servers

After configuring environment variables, restart Cursor IDE to load the MCP servers.

### ✅ Verified MCP Servers

The following servers have been verified to exist in the npm registry:

- ✅ **GitHub** - `@modelcontextprotocol/server-github` (v2025.4.8)
- ✅ **Context7** - `@upstash/context7-mcp` (v1.0.20)
- ✅ **Playwright** - `@playwright/mcp@latest`
- ✅ **Chrome DevTools** - `chrome-devtools-mcp@latest`
- ✅ **File System** - `@modelcontextprotocol/server-filesystem` (v2025.8.21)
- ✅ **Azure** - `@azure/mcp` (v0.8.3)
- ✅ **PostgreSQL** - `@henkey/postgres-mcp-server`

### ❌ Servers Not Available

The following servers do not have official MCP server packages available:

- ❌ **MindsDB** - No MCP server package found (only MindsDB SDK available)
- ❌ **TaskMaster** - No MCP server package found (task management alternatives exist)

## Troubleshooting

### Server Not Loading

If a server doesn't load, check:

1. **Package exists on npm:**
   ```bash
   npm view <package-name>
   ```

2. **Environment variables are set:**
   ```bash
   printenv | grep -i <variable-name>
   ```

3. **Cursor logs for errors:**
   - Open Cursor IDE
   - Go to Help → Toggle Developer Tools
   - Check Console tab for MCP-related errors

### Alternative Package Names

If a server fails to load, try these alternative package names:

**GitHub:**
```json
"github": {
  "command": "npx",
  "args": ["-y", "mcp-server-github"]
}
```

**File System:**
```json
"filesystem": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "${HOME}/Projects/Aegrid"]
}
```

## Configuration File Location

The MCP configuration is stored at:
```
~/.cursor/mcp.json
```

To view or edit:
```bash
cat ~/.cursor/mcp.json
code ~/.cursor/mcp.json
```

## Using MCP Servers in Cursor

Once configured, MCP servers provide enhanced capabilities:

- **GitHub**: Ask about repository status, create issues, review PRs
- **Playwright**: Automate browser interactions for testing
- **Chrome DevTools**: Debug and inspect web applications
- **File System**: Navigate and modify project files
- **Azure**: Deploy and manage Azure resources
- **PostgreSQL**: Query and analyse database directly

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit environment variables** to git
2. **Use `.env` files** for local development (already in `.gitignore`)
3. **Rotate tokens regularly**, especially GitHub PATs
4. **Limit token scopes** to minimum required permissions
5. **Use Azure service principals** for production environments

## Additional Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [Playwright MCP GitHub](https://github.com/microsoft/playwright-mcp)
- [Chrome DevTools MCP GitHub](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [PostgreSQL MCP GitHub](https://github.com/henkey/postgres-mcp-server)

## Support

For issues with MCP server configuration:

1. Check Cursor IDE logs (Help → Toggle Developer Tools → Console)
2. Verify npm package exists: `npm view <package-name>`
3. Ensure environment variables are properly set
4. Restart Cursor IDE after configuration changes

---

**Last Updated:** 1 October 2024
**Maintained By:** Aegrid Development Team
