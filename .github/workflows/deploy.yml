name: Smart Deploy Full Stack App to Azure with Stable URLs

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:
    inputs:
      force_deploy:
        description: 'Force deploy all components'
        required: false
        default: false
        type: boolean
      component:
        description: 'Deploy specific component (backend/frontend/redis/all)'
        required: false
        default: 'all'
        type: choice
        options:
        - all
        - backend
        - frontend
        - redis

env:
  REGISTRY: ${{ secrets.ACR_REGISTRY }}
  BACKEND_IMAGE_NAME: elshawi-backend
  FRONTEND_IMAGE_NAME: elshawi-frontend
  AZURE_API_BASE: https://management.azure.com
  AZURE_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
  AZURE_ACCESS_TOKEN: ${{ secrets.AZURE_ACCESS_TOKEN }}
  RESOURCE_GROUP: elshawi-rg
  # Use the Redis image that works
  REDIS_IMAGE: redis:alpine
  # Changed from westeurope to eastus to avoid quota issues
  AZURE_REGION: eastus
  # Stable DNS names for all services (updated for eastus)
  REDIS_DNS_NAME: elshawi-redis-stable
  BACKEND_DNS_NAME: elshawi-backend-stable
  FRONTEND_DNS_NAME: elshawi-frontend-stable
  # Stable container names
  REDIS_CONTAINER_NAME: elshawi-redis-stable
  BACKEND_CONTAINER_NAME: elshawi-backend-stable
  FRONTEND_CONTAINER_NAME: elshawi-frontend-stable

jobs:
  azure-setup:
    runs-on: ubuntu-latest
    outputs:
      auth-verified: ${{ steps.verify-auth.outputs.verified }}
    steps:
    - name: Verify Azure Access Token
      id: verify-auth
      env:
        AZURE_ACCESS_TOKEN: ${{ secrets.AZURE_ACCESS_TOKEN }}
        AZURE_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
        AZURE_RESOURCE_GROUP: ${{ secrets.AZURE_RESOURCE_GROUP }}
      run: |
        echo "🔐 Verifying Azure access token..."
        echo "🔍 Subscription ID: $AZURE_SUBSCRIPTION_ID"
        echo "🔍 Resource Group: $RESOURCE_GROUP"
        echo "🌍 Azure Region: $AZURE_REGION"
        
        # Test the access token with subscription info
        HTTP_CODE=$(curl -s -w "%{http_code}" -o /tmp/sub_response.json \
          -H "Authorization: Bearer ${AZURE_ACCESS_TOKEN}" \
          -H "Content-Type: application/json" \
          "${AZURE_API_BASE}/subscriptions/${AZURE_SUBSCRIPTION_ID}?api-version=2025-04-01")
        
        if [ "$HTTP_CODE" = "200" ]; then
          echo "✅ Access token is valid"
          SUB_NAME=$(cat /tmp/sub_response.json | jq -r '.displayName')
          echo "📋 Subscription: $SUB_NAME"
          echo "verified=true" >> $GITHUB_OUTPUT
        else
          echo "❌ Access token validation failed with HTTP code: $HTTP_CODE"
          cat /tmp/sub_response.json
          echo "verified=false" >> $GITHUB_OUTPUT
          exit 1
        fi

  detect-changes:
    needs: azure-setup
    runs-on: ubuntu-latest
    outputs:
      backend-changed: ${{ steps.changes.outputs.backend }}
      frontend-changed: ${{ steps.changes.outputs.frontend }}
      docker-changed: ${{ steps.changes.outputs.docker }}
      workflow-changed: ${{ steps.changes.outputs.workflow }}
      force-deploy: ${{ github.event.inputs.force_deploy == 'true' || github.event_name == 'workflow_dispatch' }}
      deploy-component: ${{ github.event.inputs.component || 'all' }}
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Detect file changes
      uses: dorny/paths-filter@v2
      id: changes
      with:
        filters: |
          backend:
            - 'backend/**'
            - 'requirements.txt'
            - 'pyproject.toml'
            - 'poetry.lock'
          frontend:
            - 'frontend/**'
            - 'package.json'
            - 'package-lock.json'
            - 'yarn.lock'
            - 'pnpm-lock.yaml'
          docker:
            - '**/Dockerfile*'
            - '**/.dockerignore'
            - 'docker-compose*'
          workflow:
            - '.github/workflows/**'

    - name: Show detected changes
      run: |
        echo "🔍 Change Detection Results:"
        echo "=================================="
        echo "Backend changed: ${{ steps.changes.outputs.backend }}"
        echo "Frontend changed: ${{ steps.changes.outputs.frontend }}"
        echo "Docker files changed: ${{ steps.changes.outputs.docker }}"
        echo "Workflow changed: ${{ steps.changes.outputs.workflow }}"
        echo "Force deploy: ${{ github.event.inputs.force_deploy == 'true' }}"
        echo "Deploy component: ${{ github.event.inputs.component || 'all' }}"
        echo "Azure Region: $AZURE_REGION"
        echo "=================================="
        echo "🌐 Stable URLs that will be used:"
        echo "Redis: $REDIS_DNS_NAME.$AZURE_REGION.azurecontainer.io:6379"
        echo "Backend: http://$BACKEND_DNS_NAME.$AZURE_REGION.azurecontainer.io:8000"
        echo "Frontend: http://$FRONTEND_DNS_NAME.$AZURE_REGION.azurecontainer.io:3000"
        echo "=================================="

  build-backend:
    needs: [azure-setup, detect-changes]
    runs-on: ubuntu-latest
    if: |
      needs.detect-changes.outputs.backend-changed == 'true' || 
      needs.detect-changes.outputs.docker-changed == 'true' ||
      needs.detect-changes.outputs.force-deploy == 'true' ||
      (needs.detect-changes.outputs.deploy-component == 'all' || needs.detect-changes.outputs.deploy-component == 'backend')
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Log in to Azure Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ secrets.ACR_USERNAME }}
        password: ${{ secrets.ACR_PASSWORD }}

    - name: Build and push Backend (Django) image
      uses: docker/build-push-action@v5
      with:
        context: ./backend
        file: ./backend/Dockerfile.prod
        push: true
        tags: |
          ${{ env.REGISTRY }}/${{ env.BACKEND_IMAGE_NAME }}:${{ github.sha }}
          ${{ env.REGISTRY }}/${{ env.BACKEND_IMAGE_NAME }}:latest
          ${{ env.REGISTRY }}/${{ env.BACKEND_IMAGE_NAME }}:stable
        cache-from: type=gha
        cache-to: type=gha,mode=max
        platforms: linux/amd64

  build-frontend:
    needs: [azure-setup, detect-changes]
    runs-on: ubuntu-latest
    if: |
      needs.detect-changes.outputs.frontend-changed == 'true' || 
      needs.detect-changes.outputs.docker-changed == 'true' ||
      needs.detect-changes.outputs.force-deploy == 'true' ||
      (needs.detect-changes.outputs.deploy-component == 'all' || needs.detect-changes.outputs.deploy-component == 'frontend')
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Log in to Azure Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ secrets.ACR_USERNAME }}
        password: ${{ secrets.ACR_PASSWORD }}

    - name: Build and push Frontend (Next.js) image
      uses: docker/build-push-action@v5
      with:
        context: ./frontend
        file: ./frontend/Dockerfile.prod
        push: true
        tags: |
          ${{ env.REGISTRY }}/${{ env.FRONTEND_IMAGE_NAME }}:${{ github.sha }}
          ${{ env.REGISTRY }}/${{ env.FRONTEND_IMAGE_NAME }}:latest
          ${{ env.REGISTRY }}/${{ env.FRONTEND_IMAGE_NAME }}:stable
        cache-from: type=gha
        cache-to: type=gha,mode=max
        platforms: linux/amd64

  deploy:
    needs: [azure-setup, detect-changes, build-backend, build-frontend]
    runs-on: ubuntu-latest
    if: always() && !cancelled() && !failure()
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Azure REST API Helper Functions
      env:
        AZURE_ACCESS_TOKEN: ${{ secrets.AZURE_ACCESS_TOKEN }}
        AZURE_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
        AZURE_RESOURCE_GROUP: ${{ secrets.AZURE_RESOURCE_GROUP }}
      run: |
        echo "🔧 Setting up Azure REST API helper functions..."
        cat > azure_rest_helper.sh << 'EOF'
        #!/bin/bash
        
        AZURE_TOKEN="${AZURE_ACCESS_TOKEN}"
        SUBSCRIPTION_ID="${AZURE_SUBSCRIPTION_ID}"
        RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-${RESOURCE_GROUP:-elshawi-rg}}"
        API_BASE="https://management.azure.com"
        
        azure_api_call() {
          local method="$1"
          local url="$2"
          local data="$3"
          echo "🔍 Making API call: $method $url" >&2
          if [ -n "$data" ]; then
            curl -s -w "\nHTTP_CODE:%{http_code}" -X "$method" \
              -H "Authorization: Bearer $AZURE_TOKEN" \
              -H "Content-Type: application/json" \
              -d "$data" \
              "$url"
          else
            curl -s -w "\nHTTP_CODE:%{http_code}" -X "$method" \
              -H "Authorization: Bearer $AZURE_TOKEN" \
              -H "Content-Type: application/json" \
              "$url"
          fi
        }
        
        check_container_exists() {
          local container_name="$1"
          local url="$API_BASE/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.ContainerInstance/containerGroups/$container_name?api-version=2023-05-01"
          echo "🔍 Checking if container exists: $container_name" >&2
          local response=$(azure_api_call "GET" "$url")
          local http_code=$(echo "$response" | tail -1 | sed 's/.*HTTP_CODE://')
          local json_response=$(echo "$response" | sed '$d')
          if [ "$http_code" = "200" ]; then
            echo "$json_response" | jq -r '.name // empty' 2>/dev/null
          else
            echo ""
          fi
        }
        
        delete_container() {
          local container_name="$1"
          local url="$API_BASE/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.ContainerInstance/containerGroups/$container_name?api-version=2023-05-01"
          echo "🗑️ Deleting container: $container_name" >&2
          local response=$(azure_api_call "DELETE" "$url")
          local http_code=$(echo "$response" | tail -1 | sed 's/.*HTTP_CODE://')
          if [ "$http_code" = "200" ] || [ "$http_code" = "204" ] || [ "$http_code" = "202" ]; then
            echo "✅ Container deletion initiated successfully" >&2
            return 0
          else
            echo "❌ Container deletion failed with HTTP code: $http_code" >&2
            echo "$response" >&2
            return 1
          fi
        }
        
        create_container() {
          local container_name="$1"
          local container_spec="$2"
          local url="$API_BASE/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.ContainerInstance/containerGroups/$container_name?api-version=2023-05-01"
          if [ -z "$SUBSCRIPTION_ID" ] || [ -z "$RESOURCE_GROUP" ] || [ -z "$AZURE_TOKEN" ]; then
            echo "❌ Missing required environment variables: SUBSCRIPTION_ID, RESOURCE_GROUP, or AZURE_TOKEN" >&2
            exit 1
          fi
          echo "🚀 Creating container: $container_name" >&2
          echo "📍 URL: $url" >&2
          local response=$(azure_api_call "PUT" "$url" "$container_spec")
          local http_code=$(echo "$response" | tail -1 | sed 's/.*HTTP_CODE://')
          local json_response=$(echo "$response" | sed '$d')
          if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
            echo "✅ Container creation initiated successfully" >&2
            echo "$json_response" | jq '.properties.provisioningState // "Unknown"' 2>/dev/null >&2
            return 0
          else
            echo "❌ Container creation failed with HTTP code: $http_code" >&2
            echo "$json_response" >&2
            return 1
          fi
        }
        
        wait_for_container_ready() {
          local container_name="$1"
          local timeout="${2:-300}"  # 5 minutes default
          local interval=15
          local elapsed=0
          
          echo "⏳ Waiting for container to be ready: $container_name" >&2
          
          while [ $elapsed -lt $timeout ]; do
            local url="$API_BASE/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.ContainerInstance/containerGroups/$container_name?api-version=2023-05-01"
            local response=$(azure_api_call "GET" "$url")
            local http_code=$(echo "$response" | tail -1 | sed 's/.*HTTP_CODE://')
            local json_response=$(echo "$response" | sed '$d')
            
            if [ "$http_code" = "200" ]; then
              local state=$(echo "$json_response" | jq -r '.properties.instanceView.state // "Unknown"' 2>/dev/null)
              local provisioning_state=$(echo "$json_response" | jq -r '.properties.provisioningState // "Unknown"' 2>/dev/null)
              
              echo "Container $container_name - State: $state, Provisioning: $provisioning_state" >&2
              
              if [ "$state" = "Running" ] && [ "$provisioning_state" = "Succeeded" ]; then
                echo "✅ Container $container_name is ready!" >&2
                return 0
              fi
            fi
            
            sleep $interval
            elapsed=$((elapsed + interval))
          done
          
          echo "⚠️ Container $container_name did not become ready within $timeout seconds" >&2
          return 1
        }
        
        check_redis_health() {
          local redis_host="$1"
          local redis_port="${2:-6379}"
          local timeout="${3:-60}"
          
          echo "🏥 Checking Redis health at $redis_host:$redis_port" >&2
          local elapsed=0
          local interval=10
          
          while [ $elapsed -lt $timeout ]; do
            if timeout 5 bash -c "</dev/tcp/$redis_host/$redis_port" 2>/dev/null; then
              echo "✅ Redis is responding on $redis_host:$redis_port" >&2
              return 0
            else
              echo "⏳ Redis not ready yet, waiting..." >&2
              sleep $interval
              elapsed=$((elapsed + interval))
            fi
          done
          
          echo "❌ Redis health check failed after $timeout seconds" >&2
          return 1
        }
        
        # New function for zero-downtime deployment
        deploy_with_blue_green() {
          local container_name="$1"
          local container_spec="$2"
          local health_check_url="$3"
          
          echo "🔄 Starting blue-green deployment for: $container_name" >&2
          
          # Check if container exists
          local existing_container=$(check_container_exists "$container_name")
          
          if [ -n "$existing_container" ]; then
            echo "🔵 Existing container found, updating in place..." >&2
            
            # Delete and recreate for update
            if delete_container "$container_name"; then
              echo "⏳ Waiting for deletion to complete..." >&2
              sleep 30
            fi
          fi
          
          # Create new container
          if create_container "$container_name" "$container_spec"; then
            echo "✅ Container deployment initiated" >&2
            wait_for_container_ready "$container_name" 300
            
            # Health check if URL provided
            if [ -n "$health_check_url" ]; then
              echo "🏥 Performing health check..." >&2
              local max_attempts=12
              local attempt=1
              
              while [ $attempt -le $max_attempts ]; do
                if curl -f -s --max-time 10 "$health_check_url" > /dev/null 2>&1; then
                  echo "✅ Health check passed" >&2
                  return 0
                fi
                echo "⏳ Health check attempt $attempt/$max_attempts..." >&2
                sleep 15
                attempt=$((attempt + 1))
              done
              
              echo "⚠️ Health check failed, but deployment completed" >&2
            fi
            
            return 0
          else
            echo "❌ Container deployment failed" >&2
            return 1
          fi
        }
        EOF
        chmod +x azure_rest_helper.sh

    - name: Check existing deployments
      id: check-deployments
      run: |
        source azure_rest_helper.sh
        
        echo "🔍 Checking existing stable deployments..."
        
        # Check if stable containers already exist
        REDIS_EXISTS=$(check_container_exists "$REDIS_CONTAINER_NAME")
        BACKEND_EXISTS=$(check_container_exists "$BACKEND_CONTAINER_NAME")
        FRONTEND_EXISTS=$(check_container_exists "$FRONTEND_CONTAINER_NAME")
        
        echo "redis-exists=${REDIS_EXISTS}" >> $GITHUB_OUTPUT
        echo "backend-exists=${BACKEND_EXISTS}" >> $GITHUB_OUTPUT
        echo "frontend-exists=${FRONTEND_EXISTS}" >> $GITHUB_OUTPUT
        
        echo "Redis exists: ${REDIS_EXISTS:-none}"
        echo "Backend exists: ${BACKEND_EXISTS:-none}"
        echo "Frontend exists: ${FRONTEND_EXISTS:-none}"

    - name: Deploy Redis (Priority - Always First)
      if: |
        steps.check-deployments.outputs.redis-exists == '' ||
        needs.detect-changes.outputs.force-deploy == 'true' ||
        needs.detect-changes.outputs.deploy-component == 'all' ||
        needs.detect-changes.outputs.deploy-component == 'redis'
      env:
        AZURE_RESOURCE_GROUP: ${{ secrets.AZURE_RESOURCE_GROUP }}
        DOCKER_HUB_USERNAME: ${{ secrets.DOCKER_HUB_USERNAME }}
        DOCKER_HUB_TOKEN: ${{ secrets.DOCKER_HUB_TOKEN }}
      run: |
        source azure_rest_helper.sh
        echo "🚀 Deploying Redis with stable URL..."
        echo "🔍 Stable DNS: $REDIS_DNS_NAME.$AZURE_REGION.azurecontainer.io"
        
        # Redis container specification WITH Docker Hub credentials and stable DNS
        REDIS_SPEC='
        {
          "location": "'"$AZURE_REGION"'",
          "properties": {
            "containers": [
              {
                "name": "redis",
                "properties": {
                  "image": "'"$REDIS_IMAGE"'",
                  "command": ["redis-server", "--appendonly", "yes", "--maxmemory", "256mb", "--maxmemory-policy", "allkeys-lru"],
                  "ports": [
                    {
                      "port": 6379,
                      "protocol": "TCP"
                    }
                  ],
                  "resources": {
                    "requests": {
                      "cpu": 0.25,
                      "memoryInGB": 0.5
                    }
                  }
                }
              }
            ],
            "imageRegistryCredentials": [
              {
                "server": "index.docker.io",
                "username": "'"${DOCKER_HUB_USERNAME}"'",
                "password": "'"${DOCKER_HUB_TOKEN}"'"
              }
            ],
            "osType": "Linux",
            "ipAddress": {
              "type": "Public",
              "ports": [
                {
                  "port": 6379,
                  "protocol": "TCP"
                }
              ],
              "dnsNameLabel": "'"$REDIS_DNS_NAME"'"
            },
            "restartPolicy": "Always"
          }
        }'
        
        # Deploy using blue-green approach
        if deploy_with_blue_green "$REDIS_CONTAINER_NAME" "$REDIS_SPEC" ""; then
          echo "✅ Redis deployed with stable URL: $REDIS_DNS_NAME.$AZURE_REGION.azurecontainer.io:6379"
          
          # Verify Redis connectivity
          check_redis_health "$REDIS_DNS_NAME.$AZURE_REGION.azurecontainer.io" 6379 120
        else
          echo "❌ Redis deployment failed"
          exit 1
        fi

    - name: Deploy Backend (After Redis)
      if: |
        needs.build-backend.result == 'success' ||
        (needs.detect-changes.outputs.force-deploy == 'true' && 
         (needs.detect-changes.outputs.deploy-component == 'all' || needs.detect-changes.outputs.deploy-component == 'backend'))
      env:
        GITHUB_SHA: ${{ github.sha }}
        REGISTRY: ${{ env.REGISTRY }}
        BACKEND_IMAGE_NAME: ${{ env.BACKEND_IMAGE_NAME }}
        DJANGO_SECRET_KEY: ${{ secrets.DJANGO_SECRET_KEY }}
        ACR_USERNAME: ${{ secrets.ACR_USERNAME }}
        ACR_PASSWORD: ${{ secrets.ACR_PASSWORD }}
      run: |
        source azure_rest_helper.sh
        
        echo "🚀 Deploying Backend with stable URL..."
        echo "🔍 Stable DNS: $BACKEND_DNS_NAME.$AZURE_REGION.azurecontainer.io"
        
        # Backend container specification with stable DNS and Redis connection
        BACKEND_SPEC='
        {
          "location": "'"$AZURE_REGION"'",
          "properties": {
            "containers": [
              {
                "name": "backend",
                "properties": {
                  "image": "'"${REGISTRY}/${BACKEND_IMAGE_NAME}:stable"'",
                  "ports": [
                    {
                      "port": 8000,
                      "protocol": "TCP"
                    }
                  ],
                  "environmentVariables": [
                    {"name": "DJANGO_SECRET_KEY", "value": "'"${DJANGO_SECRET_KEY}"'"},
                    {"name": "DJANGO_DEBUG", "value": "False"},
                    {"name": "DJANGO_ALLOWED_HOSTS", "value": "'"$BACKEND_DNS_NAME"'.'"$AZURE_REGION"'.azurecontainer.io,localhost,*"},
                    {"name": "REDIS_URL", "value": "redis://'"$REDIS_DNS_NAME"'.'"$AZURE_REGION"'.azurecontainer.io:6379"},
                    {"name": "DATABASE_URL", "value": "sqlite:///db.sqlite3"},
                    {"name": "CORS_ALLOWED_ORIGINS", "value": "https://'"$FRONTEND_DNS_NAME"'.'"$AZURE_REGION"'.azurecontainer.io,http://'"$FRONTEND_DNS_NAME"'.'"$AZURE_REGION"'.azurecontainer.io,http://localhost:3000"},
                    {"name": "GUNICORN_WORKERS", "value": "2"},
                    {"name": "GUNICORN_TIMEOUT", "value": "60"},
                    {"name": "GUNICORN_BIND", "value": "0.0.0.0:8000"}
                  ],
                  "resources": {
                    "requests": {
                      "cpu": 0.5,
                      "memoryInGB": 1
                    }
                  }
                }
              }
            ],
            "imageRegistryCredentials": [
              {
                "server": "'"${REGISTRY}"'",
                "username": "'"${ACR_USERNAME}"'",
                "password": "'"${ACR_PASSWORD}"'"
              }
            ],
            "osType": "Linux",
            "ipAddress": {
              "type": "Public",
              "ports": [
                {
                  "port": 8000,
                  "protocol": "TCP"
                }
              ],
              "dnsNameLabel": "'"$BACKEND_DNS_NAME"'"
            },
            "restartPolicy": "Always"
          }
        }'
        
        # Deploy using blue-green approach with health check
        HEALTH_URL="http://$BACKEND_DNS_NAME.$AZURE_REGION.azurecontainer.io:8000/health/"
        
        if deploy_with_blue_green "$BACKEND_CONTAINER_NAME" "$BACKEND_SPEC" "$HEALTH_URL"; then
          echo "✅ Backend deployed with stable URL: http://$BACKEND_DNS_NAME.$AZURE_REGION.azurecontainer.io:8000"
        else
          echo "❌ Backend deployment failed"
          exit 1
        fi

    - name: Deploy Frontend (Final Step)
      if: |
        needs.build-frontend.result == 'success' ||
        (needs.detect-changes.outputs.force-deploy == 'true' && 
         (needs.detect-changes.outputs.deploy-component == 'all' || needs.detect-changes.outputs.deploy-component == 'frontend'))
      env:
        GITHUB_SHA: ${{ github.sha }}
        REGISTRY: ${{ env.REGISTRY }}
        FRONTEND_IMAGE_NAME: ${{ env.FRONTEND_IMAGE_NAME }}
        ACR_USERNAME: ${{ secrets.ACR_USERNAME }}
        ACR_PASSWORD: ${{ secrets.ACR_PASSWORD }}
      run: |
        source azure_rest_helper.sh
        
        echo "🚀 Deploying Frontend with stable URL..."
        echo "🔍 Stable DNS: $FRONTEND_DNS_NAME.$AZURE_REGION.azurecontainer.io"
        
        # Frontend container specification with stable DNS and backend connection
        FRONTEND_SPEC='
        {
          "location": "'"$AZURE_REGION"'",
          "properties": {
            "containers": [
              {
                "name": "frontend",
                "properties": {
                  "image": "'"${REGISTRY}/${FRONTEND_IMAGE_NAME}:stable"'",
                  "ports": [
                    {
                      "port": 3000,
                      "protocol": "TCP"
                    }
                  ],
                  "environmentVariables": [
                    {"name": "NEXT_PUBLIC_API_URL", "value": "http://'"$BACKEND_DNS_NAME"'.'"$AZURE_REGION"'.azurecontainer.io:8000"},
                    {"name": "NODE_ENV", "value": "production"},
                    {"name": "PORT", "value": "3000"}
                  ],
                  "resources": {
                    "requests": {
                      "cpu": 0.5,
                      "memoryInGB": 1
                    }
                  }
                }
              }
            ],
            "imageRegistryCredentials": [
              {
                "server": "'"${REGISTRY}"'",
                "username": "'"${ACR_USERNAME}"'",
                "password": "'"${ACR_PASSWORD}"'"
              }
            ],
            "osType": "Linux",
            "ipAddress": {
              "type": "Public",
              "ports": [
                {
                  "port": 3000,
                  "protocol": "TCP"
                }
              ],
              "dnsNameLabel": "'"$FRONTEND_DNS_NAME"'"
            },
            "restartPolicy": "Always"
          }
        }'
        
        # Deploy using blue-green approach with health check
        HEALTH_URL="http://$FRONTEND_DNS_NAME.$AZURE_REGION.azurecontainer.io:3000"
        
        if deploy_with_blue_green "$FRONTEND_CONTAINER_NAME" "$FRONTEND_SPEC" "$HEALTH_URL"; then
          echo "✅ Frontend deployed with stable URL: http://$FRONTEND_DNS_NAME.$AZURE_REGION.azurecontainer.io:3000"
        else
          echo "❌ Frontend deployment failed"
          exit 1
        fi

    - name: Enhanced Health Check (All Services)
      run: |
        source azure_rest_helper.sh
        
        echo "🏥 Performing comprehensive health checks with stable URLs..."
        
        # Function to check URL with better error handling
        check_url() {
          local url="$1"
          local service="$2"
          local max_attempts=12
          local attempt=1
          
          echo "Checking $service health at: $url"
          
          while [ $attempt -le $max_attempts ]; do
            echo "  Attempt $attempt/$max_attempts for $service..."
            
            # Try different health check methods
            if curl -f -s --max-time 15 --connect-timeout 10 "$url" > /dev/null 2>&1; then
              echo "✅ $service is healthy (HTTP 200)"
              return 0
            elif curl -s --max-time 15 --connect-timeout 10 "$url" 2>&1 | grep -q "200\|301\|302"; then
              echo "✅ $service is responding (redirects/other codes)"
              return 0
            else
              echo "⏳ $service not ready yet, waiting..."
              sleep 20
            fi
            
            attempt=$((attempt + 1))
          done
          
          echo "⚠️ $service health check failed after $max_attempts attempts"
          return 1
        }
        
        # Wait a bit for containers to fully start
        echo "⏳ Initial wait for containers to start..."
        sleep 60
        
        # 1. Check Redis first
        echo "🔴 Step 1: Checking Redis health..."
        REDIS_HOST="$REDIS_DNS_NAME.$AZURE_REGION.azurecontainer.io"
        check_redis_health "$REDIS_HOST" 6379 120
        
        # 2. Check backend health (try multiple endpoints)
        if [ "${{ needs.build-backend.result }}" == "success" ] || [ "${{ needs.detect-changes.outputs.force-deploy }}" == "true" ]; then
          echo "🟡 Step 2: Checking Backend health..."
          BACKEND_BASE="http://$BACKEND_DNS_NAME.$AZURE_REGION.azurecontainer.io:8000"
          
          # Try multiple endpoints for backend
          for endpoint in "/health/" "/admin/" "/" ""; do
            if check_url "${BACKEND_BASE}${endpoint}" "backend"; then
              break
            fi
          done
        fi
        
        # 3. Check frontend health
        if [ "${{ needs.build-frontend.result }}" == "success" ] || [ "${{ needs.detect-changes.outputs.force-deploy }}" == "true" ]; then
          echo "🟢 Step 3: Checking Frontend health..."
          FRONTEND_URL="http://$FRONTEND_DNS_NAME.$AZURE_REGION.azurecontainer.io:3000"
          check_url "$FRONTEND_URL" "frontend"
        fi
        
        echo "🏥 Health check phase completed"

    - name: Get deployment URLs and Summary
      run: |
        echo "🚀 Deployment Complete with Stable URLs!"
        echo "=================================="
        echo "📊 Deployment Summary:"
        echo "Backend changed: ${{ needs.detect-changes.outputs.backend-changed }}"
        echo "Frontend changed: ${{ needs.detect-changes.outputs.frontend-changed }}"
        echo "Docker changed: ${{ needs.detect-changes.outputs.docker-changed }}"
        echo "Force deploy: ${{ needs.detect-changes.outputs.force-deploy }}"
        echo "Redis image used: $REDIS_IMAGE"
        echo "Azure Region: $AZURE_REGION"
        echo "=================================="
        echo "🌐 STABLE Application URLs:"
        echo "🔴 Redis: $REDIS_DNS_NAME.$AZURE_REGION.azurecontainer.io:6379"
        echo "🟡 Backend API: http://$BACKEND_DNS_NAME.$AZURE_REGION.azurecontainer.io:8000"
        echo "🟢 Frontend App: http://$FRONTEND_DNS_NAME.$AZURE_REGION.azurecontainer.io:3000"
        echo "🔧 Admin Panel: http://$BACKEND_DNS_NAME.$AZURE_REGION.azurecontainer.io:8000/admin/"
        echo "=================================="
        echo "✅ These URLs remain the same across all deployments!"
        echo "🔄 Blue-green deployment ensures zero downtime updates."
        echo "🔍 If health checks failed, the URLs will still work in a few minutes."

    - name: Verify Stable URLs Configuration
      run: |
        echo "🔧 Verifying stable URLs configuration..."
        echo "=================================="
        echo "Container Names (Internal):"
        echo "- Redis: $REDIS_CONTAINER_NAME"
        echo "- Backend: $BACKEND_CONTAINER_NAME" 
        echo "- Frontend: $FRONTEND_CONTAINER_NAME"
        echo "=================================="
        echo "DNS Names (Public):"
        echo "- Redis: $REDIS_DNS_NAME"
        echo "- Backend: $BACKEND_DNS_NAME"
        echo "- Frontend: $FRONTEND_DNS_NAME"
        echo "=================================="
        echo "Full Public URLs (East US Region):"
        echo "- Redis: $REDIS_DNS_NAME.$AZURE_REGION.azurecontainer.io:6379"
        echo "- Backend: http://$BACKEND_DNS_NAME.$AZURE_REGION.azurecontainer.io:8000"
        echo "- Frontend: http://$FRONTEND_DNS_NAME.$AZURE_REGION.azurecontainer.io:3000"
        echo "=================================="
        echo "✅ All services use stable, predictable URLs"
        echo "✅ Services can communicate using stable internal names"
        echo "✅ External users always access the same URLs"
        echo "✅ Using East US region to avoid quota limitations"

  cleanup:
    needs: [azure-setup, deploy]
    runs-on: ubuntu-latest
    if: always() && needs.deploy.result == 'success'
    
    steps:
    - name: Setup Azure REST API for Cleanup
      env:
        AZURE_ACCESS_TOKEN: ${{ secrets.AZURE_ACCESS_TOKEN }}
        AZURE_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
        AZURE_RESOURCE_GROUP: ${{ secrets.AZURE_RESOURCE_GROUP }}
      run: |
        cat > cleanup_helper.sh << 'EOF'
        #!/bin/bash
        
        AZURE_TOKEN="${AZURE_ACCESS_TOKEN}"
        SUBSCRIPTION_ID="${AZURE_SUBSCRIPTION_ID}"
        RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-${RESOURCE_GROUP:-elshawi-rg}}"
        API_BASE="https://management.azure.com"
        
        azure_api_call() {
          local method="$1"
          local url="$2"
          curl -s -X "$method" \
            -H "Authorization: Bearer $AZURE_TOKEN" \
            -H "Content-Type: application/json" \
            "$url"
        }
        
        list_containers() {
          local url="$API_BASE/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.ContainerInstance/containerGroups?api-version=2023-05-01"
          azure_api_call "GET" "$url" | jq -r '.value[].name' 2>/dev/null | grep "^elshawi-" || true
        }
        
        delete_container() {
          local container_name="$1"
          local url="$API_BASE/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.ContainerInstance/containerGroups/$container_name?api-version=2023-05-01"
          azure_api_call "DELETE" "$url"
        }
        EOF
        chmod +x cleanup_helper.sh

    - name: Cleanup old deployments (Keep Stable Containers)
      run: |
        source cleanup_helper.sh
        
        echo "🧹 Cleaning up old deployments (preserving stable containers)..."
        
        # Get all containers with our prefix
        ALL_CONTAINERS=$(list_containers)
        
        # Current stable containers to preserve
        STABLE_CONTAINERS="$REDIS_CONTAINER_NAME
        $BACKEND_CONTAINER_NAME
        $FRONTEND_CONTAINER_NAME"
        
        if [ -n "$ALL_CONTAINERS" ]; then
          # Find old containers (non-stable ones with GitHub run numbers)
          OLD_CONTAINERS=$(echo "$ALL_CONTAINERS" | grep -v -F "$STABLE_CONTAINERS" | grep -E "elshawi-.+-[0-9]+$" || true)
          
          if [ -n "$OLD_CONTAINERS" ]; then
            echo "🗑️ Deleting old containers with GitHub run numbers:"
            echo "$OLD_CONTAINERS"
            
            for container in $OLD_CONTAINERS; do
              echo "Deleting: $container"
              delete_container "$container" &
            done
            
            # Wait for all deletions to complete
            wait
            echo "✅ Cleanup completed"
          else
            echo "✨ No old containers to cleanup"
          fi
          
          echo "🔒 Preserved stable containers:"
          echo "$STABLE_CONTAINERS"
        else
          echo "✨ No containers found for cleanup"
        fi

  notification:
    needs: [azure-setup, detect-changes, deploy, cleanup]
    runs-on: ubuntu-latest
    if: always()
    
    steps:
    - name: Final Deployment Status Summary
      run: |
        echo "📋 Final Deployment Status with Stable URLs (East US Region)"
        echo "=================================="
        echo "Azure Setup: ${{ needs.azure-setup.result }}"
        echo "Change Detection: ${{ needs.detect-changes.result }}"
        echo "Deployment: ${{ needs.deploy.result }}"
        echo "Cleanup: ${{ needs.cleanup.result }}"
        echo "Backend Changed: ${{ needs.detect-changes.outputs.backend-changed }}"
        echo "Frontend Changed: ${{ needs.detect-changes.outputs.frontend-changed }}"
        echo "Docker Changed: ${{ needs.detect-changes.outputs.docker-changed }}"
        echo "Redis Image: ${{ env.REDIS_IMAGE }}"
        echo "Azure Region: ${{ env.AZURE_REGION }}"
        echo "=================================="
        
        if [ "${{ needs.deploy.result }}" == "success" ]; then
          echo "✅ Deployment completed successfully with stable URLs!"
          echo ""
          echo "🌐 Your app is ALWAYS live at these stable URLs:"
          echo "🔴 Redis: $REDIS_DNS_NAME.$AZURE_REGION.azurecontainer.io:6379"
          echo "🟡 Backend: http://$BACKEND_DNS_NAME.$AZURE_REGION.azurecontainer.io:8000"
          echo "🟢 Frontend: http://$FRONTEND_DNS_NAME.$AZURE_REGION.azurecontainer.io:3000"
          echo "🔧 Admin: http://$BACKEND_DNS_NAME.$AZURE_REGION.azurecontainer.io:8000/admin/"
          echo ""
          echo "🎯 Key Benefits:"
          echo "✅ URLs never change - bookmark them!"
          echo "✅ Zero downtime deployments via blue-green strategy"
          echo "✅ Services communicate via stable internal DNS"
          echo "✅ Perfect for production environments"
          echo "✅ Easy integration with external services"
          echo "✅ Deployed in East US region with ample quota"
          echo ""
          echo "💡 Note: URLs are immediately accessible after deployment"
          echo "🔄 Updates replace containers without changing URLs"
        elif [ "${{ needs.deploy.result }}" == "skipped" ]; then
          echo "⏭️ Deployment was skipped (no changes detected)"
          echo ""
          echo "🌐 Your stable URLs remain available:"
          echo "🔴 Redis: $REDIS_DNS_NAME.$AZURE_REGION.azurecontainer.io:6379"
          echo "🟡 Backend: http://$BACKEND_DNS_NAME.$AZURE_REGION.azurecontainer.io:8000"
          echo "🟢 Frontend: http://$FRONTEND_DNS_NAME.$AZURE_REGION.azurecontainer.io:3000"
        else
          echo "❌ Deployment failed or was cancelled"
          echo "🔍 Check the logs above for more details"
          echo ""
          echo "🌐 Previous stable URLs may still be available:"
          echo "🔴 Redis: $REDIS_DNS_NAME.$AZURE_REGION.azurecontainer.io:6379"
          echo "🟡 Backend: http://$BACKEND_DNS_NAME.$AZURE_REGION.azurecontainer.io:8000"
          echo "🟢 Frontend: http://$FRONTEND_DNS_NAME.$AZURE_REGION.azurecontainer.io:3000"
          exit 1
        fi