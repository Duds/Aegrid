#!/bin/bash

# Container Security Scanning Script
# Provides comprehensive container security analysis

set -e

echo "🐳 Aegrid Container Security Scanner"
echo "=========================================="

# Configuration
IMAGE_NAME="councilworks"
IMAGE_TAG="security-scan"
DOCKERFILE_PATH="./Dockerfile"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Build Docker image
print_status $BLUE "📦 Building Docker image..."
if docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .; then
    print_status $GREEN "✅ Docker image built successfully"
else
    print_status $RED "❌ Docker image build failed"
    exit 1
fi

# Run Snyk container scan
print_status $BLUE "🔍 Running Snyk container scan..."
if command_exists snyk; then
    if snyk container test ${IMAGE_NAME}:${IMAGE_TAG} --severity-threshold=medium; then
        print_status $GREEN "✅ Snyk container scan passed"
    else
        print_status $YELLOW "⚠️  Snyk found vulnerabilities (see details above)"
    fi
else
    print_status $YELLOW "⚠️  Snyk not installed, skipping container scan"
fi

# Run Trivy scan (if available)
print_status $BLUE "🔍 Running Trivy container scan..."
if command_exists trivy; then
    if trivy image --severity HIGH,CRITICAL ${IMAGE_NAME}:${IMAGE_TAG}; then
        print_status $GREEN "✅ Trivy scan passed"
    else
        print_status $YELLOW "⚠️  Trivy found high/critical vulnerabilities"
    fi
else
    print_status $YELLOW "⚠️  Trivy not installed, skipping scan"
fi

# Docker image analysis
print_status $BLUE "📊 Analyzing Docker image..."
echo "Image size: $(docker images ${IMAGE_NAME}:${IMAGE_TAG} --format "table {{.Size}}")"
echo "Layers: $(docker history ${IMAGE_NAME}:${IMAGE_TAG} --format "table {{.CreatedBy}}" | wc -l)"

# Security best practices check
print_status $BLUE "🛡️  Checking security best practices..."

# Check for root user
if docker run --rm ${IMAGE_NAME}:${IMAGE_TAG} whoami | grep -q root; then
    print_status $YELLOW "⚠️  Container runs as root user"
else
    print_status $GREEN "✅ Container does not run as root"
fi

# Check for unnecessary packages
print_status $BLUE "📦 Checking for unnecessary packages..."
docker run --rm ${IMAGE_NAME}:${IMAGE_TAG} sh -c "apk list --installed 2>/dev/null | wc -l || dpkg -l 2>/dev/null | wc -l || echo 'Package manager not detected'"

# Generate security report
print_status $BLUE "📋 Generating container security report..."
cat > CONTAINER-SECURITY-REPORT.md << EOF
# Container Security Report

**Generated:** $(date)
**Image:** ${IMAGE_NAME}:${IMAGE_TAG}
**Dockerfile:** ${DOCKERFILE_PATH}

## Scan Results

### Snyk Container Scan
- Status: $(if command_exists snyk; then echo "Completed"; else echo "Skipped (Snyk not installed)"; fi)
- Severity Threshold: Medium

### Trivy Scan
- Status: $(if command_exists trivy; then echo "Completed"; else echo "Skipped (Trivy not installed)"; fi)
- Severity Threshold: High, Critical

## Security Best Practices

### User Privileges
- Root User: $(if docker run --rm ${IMAGE_NAME}:${IMAGE_TAG} whoami | grep -q root; then echo "⚠️  Yes"; else echo "✅ No"; fi)

### Image Analysis
- Image Size: $(docker images ${IMAGE_NAME}:${IMAGE_TAG} --format "{{.Size}}")
- Layer Count: $(docker history ${IMAGE_NAME}:${IMAGE_TAG} --format "{{.CreatedBy}}" | wc -l)

## Recommendations

1. **Regular Scanning**: Run container scans on every build
2. **Base Image Updates**: Keep base images updated
3. **Minimal Images**: Use Alpine or distroless base images
4. **Non-root User**: Run containers as non-root user
5. **Secrets Management**: Never embed secrets in images

## Next Steps

- Review any vulnerabilities found
- Update base images regularly
- Implement container image signing
- Set up automated security scanning in CI/CD
EOF

print_status $GREEN "✅ Container security report generated: CONTAINER-SECURITY-REPORT.md"

# Cleanup
print_status $BLUE "🧹 Cleaning up..."
docker rmi ${IMAGE_NAME}:${IMAGE_TAG} 2>/dev/null || true

print_status $GREEN "🎉 Container security scan completed!"
print_status $BLUE "📋 Review the security report for detailed findings"
