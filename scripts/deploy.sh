#!/bin/bash

# Aegrid Universal Deployment Script
# Supports all deployment tiers: SaaS, Single-Tenant, Hybrid, On-Premise

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DEPLOYMENT_TIER="saas"
CUSTOMER_ID=""
ENVIRONMENT="production"
BUILD_IMAGE="true"
PUSH_IMAGE="true"
RUN_TESTS="true"
SKIP_MIGRATIONS="false"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -t, --tier TIER          Deployment tier (saas|single-tenant|hybrid|on-premise)"
    echo "  -c, --customer-id ID     Customer ID for single-tenant deployments"
    echo "  -e, --environment ENV    Environment (development|staging|production)"
    echo "  --no-build              Skip Docker image build"
    echo "  --no-push               Skip pushing Docker image to registry"
    echo "  --no-tests              Skip running tests"
    echo "  --skip-migrations       Skip database migrations"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --tier saas --environment production"
    echo "  $0 --tier single-tenant --customer-id acme-council --environment staging"
    echo "  $0 --tier on-premise --environment production --no-push"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--tier)
            DEPLOYMENT_TIER="$2"
            shift 2
            ;;
        -c|--customer-id)
            CUSTOMER_ID="$2"
            shift 2
            ;;
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --no-build)
            BUILD_IMAGE="false"
            shift
            ;;
        --no-push)
            PUSH_IMAGE="false"
            shift
            ;;
        --no-tests)
            RUN_TESTS="false"
            shift
            ;;
        --skip-migrations)
            SKIP_MIGRATIONS="true"
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate deployment tier
case $DEPLOYMENT_TIER in
    saas|single-tenant|hybrid|on-premise)
        ;;
    *)
        print_error "Invalid deployment tier: $DEPLOYMENT_TIER"
        print_error "Valid tiers: saas, single-tenant, hybrid, on-premise"
        exit 1
        ;;
esac

# Validate customer ID for single-tenant deployments
if [[ "$DEPLOYMENT_TIER" == "single-tenant" && -z "$CUSTOMER_ID" ]]; then
    print_error "Customer ID is required for single-tenant deployments"
    exit 1
fi

# Validate environment
case $ENVIRONMENT in
    development|staging|production)
        ;;
    *)
        print_error "Invalid environment: $ENVIRONMENT"
        print_error "Valid environments: development, staging, production"
        exit 1
        ;;
esac

print_status "Starting deployment..."
print_status "Deployment Tier: $DEPLOYMENT_TIER"
print_status "Environment: $ENVIRONMENT"
if [[ -n "$CUSTOMER_ID" ]]; then
    print_status "Customer ID: $CUSTOMER_ID"
fi

# Set environment variables
export DEPLOYMENT_TIER=$DEPLOYMENT_TIER
export CUSTOMER_ID=$CUSTOMER_ID
export ENVIRONMENT=$ENVIRONMENT

# Function to run tests
run_tests() {
    if [[ "$RUN_TESTS" == "true" ]]; then
        print_status "Running tests..."

        # Run unit tests
        npm run test:unit

        # Run integration tests
        npm run test:integration

        # Run build tests
        npm run build

        print_success "All tests passed"
    else
        print_warning "Skipping tests"
    fi
}

# Function to build Docker image
build_image() {
    if [[ "$BUILD_IMAGE" == "true" ]]; then
        print_status "Building Docker image..."

        # Build image with tier-specific tag
        IMAGE_TAG="councilworks:$DEPLOYMENT_TIER-$ENVIRONMENT"
        if [[ -n "$CUSTOMER_ID" ]]; then
            IMAGE_TAG="councilworks:$DEPLOYMENT_TIER-$CUSTOMER_ID-$ENVIRONMENT"
        fi

        docker build -t $IMAGE_TAG .

        print_success "Docker image built: $IMAGE_TAG"
    else
        print_warning "Skipping Docker image build"
    fi
}

# Function to push Docker image
push_image() {
    if [[ "$PUSH_IMAGE" == "true" && "$BUILD_IMAGE" == "true" ]]; then
        print_status "Pushing Docker image..."

        IMAGE_TAG="councilworks:$DEPLOYMENT_TIER-$ENVIRONMENT"
        if [[ -n "$CUSTOMER_ID" ]]; then
            IMAGE_TAG="councilworks:$DEPLOYMENT_TIER-$CUSTOMER_ID-$ENVIRONMENT"
        fi

        # Push to registry (Azure Container Registry, Docker Hub, etc.)
        docker push $IMAGE_TAG

        print_success "Docker image pushed: $IMAGE_TAG"
    else
        print_warning "Skipping Docker image push"
    fi
}

# Function to deploy based on tier
deploy() {
    print_status "Deploying to $DEPLOYMENT_TIER environment..."

    case $DEPLOYMENT_TIER in
        saas)
            deploy_saas
            ;;
        single-tenant)
            deploy_single_tenant
            ;;
        hybrid)
            deploy_hybrid
            ;;
        on-premise)
            deploy_on_premise
            ;;
    esac
}

# Function to deploy SaaS
deploy_saas() {
    print_status "Deploying SaaS multi-tenant application..."

    # Use docker-compose for SaaS deployment
    docker-compose -f docker-compose.saas.yml down
    docker-compose -f docker-compose.saas.yml up -d

    print_success "SaaS deployment completed"
}

# Function to deploy single-tenant
deploy_single_tenant() {
    print_status "Deploying single-tenant application for customer: $CUSTOMER_ID"

    # Set customer-specific environment variables
    export CUSTOMER_DATABASE_URL="postgresql://user:pass@host:5432/council_$CUSTOMER_ID"
    export CUSTOMER_STORAGE_CONTAINER="council-$CUSTOMER_ID"

    # Use customer-specific docker-compose
    docker-compose -f docker-compose.single-tenant.yml down
    docker-compose -f docker-compose.single-tenant.yml up -d

    print_success "Single-tenant deployment completed for customer: $CUSTOMER_ID"
}

# Function to deploy hybrid
deploy_hybrid() {
    print_status "Deploying hybrid application..."

    # Use hybrid docker-compose
    docker-compose -f docker-compose.hybrid.yml down
    docker-compose -f docker-compose.hybrid.yml up -d

    print_success "Hybrid deployment completed"
}

# Function to deploy on-premise
deploy_on_premise() {
    print_status "Deploying on-premise application..."

    # Use on-premise docker-compose
    docker-compose -f docker-compose.on-premise.yml down
    docker-compose -f docker-compose.on-premise.yml up -d

    print_success "On-premise deployment completed"
}

# Function to run database migrations
run_migrations() {
    if [[ "$SKIP_MIGRATIONS" == "false" ]]; then
        print_status "Running database migrations..."

        # Run Prisma migrations
        npx prisma migrate deploy

        # Run tier-specific migrations
        case $DEPLOYMENT_TIER in
            saas)
                # No additional migrations needed for SaaS
                ;;
            single-tenant)
                # Run single-tenant specific migrations
                npx prisma migrate deploy --schema=./prisma/schema.single-tenant.prisma
                ;;
            on-premise)
                # Run on-premise specific migrations
                npx prisma migrate deploy --schema=./prisma/schema.on-premise.prisma
                ;;
        esac

        print_success "Database migrations completed"
    else
        print_warning "Skipping database migrations"
    fi
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."

    # Wait for services to start
    sleep 30

    # Check health endpoint
    HEALTH_URL="http://localhost:3000/api/health"
    if [[ "$DEPLOYMENT_TIER" == "single-tenant" && -n "$CUSTOMER_ID" ]]; then
        HEALTH_URL="http://localhost:3000/api/health?customer=$CUSTOMER_ID"
    fi

    # Retry health check
    for i in {1..10}; do
        if curl -f $HEALTH_URL > /dev/null 2>&1; then
            print_success "Health check passed"
            return 0
        fi
        print_warning "Health check failed, retrying... ($i/10)"
        sleep 10
    done

    print_error "Health check failed after 10 attempts"
    return 1
}

# Function to cleanup on failure
cleanup_on_failure() {
    print_error "Deployment failed, cleaning up..."

    case $DEPLOYMENT_TIER in
        saas)
            docker-compose -f docker-compose.saas.yml down
            ;;
        single-tenant)
            docker-compose -f docker-compose.single-tenant.yml down
            ;;
        hybrid)
            docker-compose -f docker-compose.hybrid.yml down
            ;;
        on-premise)
            docker-compose -f docker-compose.on-premise.yml down
            ;;
    esac

    print_warning "Cleanup completed"
}

# Main deployment flow
main() {
    # Set trap for cleanup on failure
    trap cleanup_on_failure ERR

    # Run tests
    run_tests

    # Build image
    build_image

    # Push image
    push_image

    # Run migrations
    run_migrations

    # Deploy
    deploy

    # Verify deployment
    verify_deployment

    print_success "Deployment completed successfully!"
    print_status "Application is available at: http://localhost:3000"

    if [[ "$DEPLOYMENT_TIER" == "single-tenant" && -n "$CUSTOMER_ID" ]]; then
        print_status "Customer-specific URL: http://localhost:3000?customer=$CUSTOMER_ID"
    fi
}

# Run main function
main
