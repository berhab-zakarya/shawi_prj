name: Smart Azure Full Stack Deployment

on:
  push:
    branches: [main, master, staging, develop]
  pull_request:
    branches: [main, master]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: false
        default: 'auto'
        type: choice
        options: [auto, prod, staging, dev]
      components:
        description: 'Components to deploy'
        required: false
        default: 'all'
        type: choice
        options: [all, backend, frontend, redis]
      force_deploy:
        description: 'Force deploy all components'
        required: false
        default: false
        type: boolean

env:
  REGISTRY: ${{ secrets.ACR_REGISTRY }}
  PROJECT_NAME: elshawi
  AZURE_REGION: westeurope

jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      environment: ${{ steps.env.outputs.environment }}
      deploy-backend: ${{ steps.changes.outputs.backend }}
      deploy-frontend: ${{ steps.changes.outputs.frontend }}
      deploy-redis: ${{ steps.changes.outputs.redis }}
      base-url: ${{ steps.env.outputs.base-url }}
    steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Determine Environment & Changes
      id: env
      env:
        INPUT_ENV: ${{ github.event.inputs.environment || 'auto' }}
        FORCE_DEPLOY: ${{ github.event.inputs.force_deploy == 'true' }}
      run: |
        # Smart environment detection
        if [ "$INPUT_ENV" = "auto" ]; then
          case "${{ github.ref_name }}" in
            main|master) ENV="prod" ;;
            staging) ENV="staging" ;;
            develop) ENV="dev" ;;
            *) ENV="dev" ;;
          esac
        else
          ENV="$INPUT_ENV"
        fi
        
        # Generate stable URLs
        BASE_URL="${PROJECT_NAME}-${ENV}"
        
        echo "environment=$ENV" >> $GITHUB_OUTPUT
        echo "base-url=$BASE_URL" >> $GITHUB_OUTPUT
        echo "🌍 Environment: $ENV"
        echo "🔗 Base URL: $BASE_URL"

    - name: Detect Changes
      id: changes
      uses: dorny/paths-filter@v2
      with:
        filters: |
          backend:
            - 'backend/**'
            - 'requirements.txt'
            - '**/Dockerfile*'
          frontend:
            - 'frontend/**'
            - 'package*.json'
            - '**/Dockerfile*'
          redis:
            - '.github/workflows/**'
            - 'docker-compose*'
      
    - name: Set Deploy Flags
      run: |
        FORCE="${{ github.event.inputs.force_deploy == 'true' }}"
        COMPONENT="${{ github.event.inputs.components || 'all' }}"
        
        # Smart deployment logic
        DEPLOY_BACKEND="false"
        DEPLOY_FRONTEND="false"
        DEPLOY_REDIS="false"
        
        if [ "$FORCE" = "true" ] || [ "$COMPONENT" = "all" ]; then
          DEPLOY_BACKEND="true"
          DEPLOY_FRONTEND="true" 
          DEPLOY_REDIS="true"
        else
          [ "${{ steps.changes.outputs.backend }}" = "true" ] && DEPLOY_BACKEND="true"
          [ "${{ steps.changes.outputs.frontend }}" = "true" ] && DEPLOY_FRONTEND="true"
          [ "${{ steps.changes.outputs.redis }}" = "true" ] && DEPLOY_REDIS="true"
          [ "$COMPONENT" = "backend" ] && DEPLOY_BACKEND="true"
          [ "$COMPONENT" = "frontend" ] && DEPLOY_FRONTEND="true"
          [ "$COMPONENT" = "redis" ] && DEPLOY_REDIS="true"
        fi
        
        echo "DEPLOY_BACKEND=$DEPLOY_BACKEND" >> $GITHUB_ENV
        echo "DEPLOY_FRONTEND=$DEPLOY_FRONTEND" >> $GITHUB_ENV
        echo "DEPLOY_REDIS=$DEPLOY_REDIS" >> $GITHUB_ENV

  build:
    needs: setup
    runs-on: ubuntu-latest
    strategy:
      matrix:
        component: [backend, frontend]
      fail-fast: false
    if: |
      (matrix.component == 'backend' && needs.setup.outputs.deploy-backend == 'true') ||
      (matrix.component == 'frontend' && needs.setup.outputs.deploy-frontend == 'true')
    steps:
    - uses: actions/checkout@v4
    - uses: docker/setup-buildx-action@v3
    - uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ secrets.ACR_USERNAME }}
        password: ${{ secrets.ACR_PASSWORD }}

    - name: Build & Push
      uses: docker/build-push-action@v5
      with:
        context: ./${{ matrix.component }}
        file: ./${{ matrix.component }}/Dockerfile.prod
        push: true
        tags: |
          ${{ env.REGISTRY }}/${{ env.PROJECT_NAME }}-${{ matrix.component }}:${{ github.sha }}
          ${{ env.REGISTRY }}/${{ env.PROJECT_NAME }}-${{ matrix.component }}:${{ needs.setup.outputs.environment }}
        cache-from: type=gha,scope=${{ matrix.component }}
        cache-to: type=gha,scope=${{ matrix.component }},mode=max

  deploy:
    needs: [setup, build]
    runs-on: ubuntu-latest
    if: always() && !cancelled()
    environment: ${{ needs.setup.outputs.environment }}
    steps:
    - name: Setup Azure API
      run: |
        cat > azure.sh << 'EOF'
        #!/bin/bash
        API_BASE="https://management.azure.com"
        RG="${{ secrets.AZURE_RESOURCE_GROUP }}"
        SUB="${{ secrets.AZURE_SUBSCRIPTION_ID }}"
        TOKEN="${{ secrets.AZURE_ACCESS_TOKEN }}"
        
        api() {
          curl -s -w "\n%{http_code}" -X "$1" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            ${3:+-d "$3"} "$2"
        }
        
        deploy_container() {
          local name="$1" spec="$2"
          echo "🚀 Deploying $name..."
          
          # Zero-downtime: Create new, delete old
          local url="$API_BASE/subscriptions/$SUB/resourceGroups/$RG/providers/Microsoft.ContainerInstance/containerGroups/$name?api-version=2023-05-01"
          local result=$(api PUT "$url" "$spec")
          local code=$(echo "$result" | tail -1)
          
          if [[ "$code" =~ ^(200|201)$ ]]; then
            echo "✅ $name deployed successfully"
            return 0
          else
            echo "❌ $name deployment failed: $code"
            echo "$result" | head -n -1
            return 1
          fi
        }
        
        wait_ready() {
          local name="$1" timeout="${2:-300}"
          echo "⏳ Waiting for $name to be ready..."
          local url="$API_BASE/subscriptions/$SUB/resourceGroups/$RG/providers/Microsoft.ContainerInstance/containerGroups/$name?api-version=2023-05-01"
          
          for i in $(seq 1 $((timeout/15))); do
            local result=$(api GET "$url")
            local state=$(echo "$result" | head -n -1 | jq -r '.properties.instanceView.state // "Unknown"' 2>/dev/null)
            
            [ "$state" = "Running" ] && { echo "✅ $name is ready!"; return 0; }
            sleep 15
          done
          
          echo "⚠️ $name not ready after ${timeout}s"
          return 1
        }
        
        health_check() {
          local url="$1" name="$2"
          echo "🏥 Health checking $name..."
          
          for i in {1..10}; do
            if curl -f -s --max-time 10 "$url" >/dev/null 2>&1; then
              echo "✅ $name is healthy"
              return 0
            fi
            sleep 10
          done
          
          echo "⚠️ $name health check failed"
          return 1
        }
        EOF
        chmod +x azure.sh

    - name: Deploy Redis
      if: env.DEPLOY_REDIS == 'true'
      env:
        BASE_URL: ${{ needs.setup.outputs.base-url }}
        ENV: ${{ needs.setup.outputs.environment }}
      run: |
        source azure.sh
        
        REDIS_SPEC='{
          "location": "${{ env.AZURE_REGION }}",
          "properties": {
            "containers": [{
              "name": "redis",
              "properties": {
                "image": "redis:7-alpine",
                "command": ["redis-server", "--appendonly", "yes", "--maxmemory", "512mb", "--maxmemory-policy", "allkeys-lru"],
                "ports": [{"port": 6379, "protocol": "TCP"}],
                "resources": {"requests": {"cpu": 0.5, "memoryInGB": 0.5}}
              }
            }],
            "osType": "Linux",
            "ipAddress": {
              "type": "Public",
              "ports": [{"port": 6379, "protocol": "TCP"}],
              "dnsNameLabel": "'${BASE_URL}'-redis"
            },
            "restartPolicy": "Always"
          }
        }'
        
        deploy_container "${BASE_URL}-redis" "$REDIS_SPEC"
        wait_ready "${BASE_URL}-redis" 180

    - name: Deploy Backend
      if: env.DEPLOY_BACKEND == 'true'
      env:
        BASE_URL: ${{ needs.setup.outputs.base-url }}
        ENV: ${{ needs.setup.outputs.environment }}
      run: |
        source azure.sh
        
        BACKEND_SPEC='{
          "location": "${{ env.AZURE_REGION }}",
          "properties": {
            "containers": [{
              "name": "backend",
              "properties": {
                "image": "${{ env.REGISTRY }}/${{ env.PROJECT_NAME }}-backend:${{ github.sha }}",
                "ports": [{"port": 8000, "protocol": "TCP"}],
                "environmentVariables": [
                  {"name": "DJANGO_SECRET_KEY", "value": "${{ secrets.DJANGO_SECRET_KEY }}"},
                  {"name": "DJANGO_DEBUG", "value": "'$([[ "$ENV" == "prod" ]] && echo "False" || echo "True")'"},
                  {"name": "DJANGO_ALLOWED_HOSTS", "value": "'${BASE_URL}'-backend.${{ env.AZURE_REGION }}.azurecontainer.io,*"},
                  {"name": "REDIS_URL", "value": "redis://'${BASE_URL}'-redis.${{ env.AZURE_REGION }}.azurecontainer.io:6379"},
                  {"name": "CORS_ALLOWED_ORIGINS", "value": "https://'${BASE_URL}'-frontend.${{ env.AZURE_REGION }}.azurecontainer.io"},
                  {"name": "DATABASE_URL", "value": "sqlite:///db.sqlite3"}
                ],
                "resources": {"requests": {"cpu": 1, "memoryInGB": 1.5}}
              }
            }],
            "imageRegistryCredentials": [{
              "server": "${{ env.REGISTRY }}",
              "username": "${{ secrets.ACR_USERNAME }}",
              "password": "${{ secrets.ACR_PASSWORD }}"
            }],
            "osType": "Linux",
            "ipAddress": {
              "type": "Public",
              "ports": [{"port": 8000, "protocol": "TCP"}],
              "dnsNameLabel": "'${BASE_URL}'-backend"
            },
            "restartPolicy": "Always"
          }
        }'
        
        deploy_container "${BASE_URL}-backend" "$BACKEND_SPEC"
        wait_ready "${BASE_URL}-backend" 300

    - name: Deploy Frontend
      if: env.DEPLOY_FRONTEND == 'true'
      env:
        BASE_URL: ${{ needs.setup.outputs.base-url }}
        ENV: ${{ needs.setup.outputs.environment }}
      run: |
        source azure.sh
        
        FRONTEND_SPEC='{
          "location": "${{ env.AZURE_REGION }}",
          "properties": {
            "containers": [{
              "name": "frontend",
              "properties": {
                "image": "${{ env.REGISTRY }}/${{ env.PROJECT_NAME }}-frontend:${{ github.sha }}",
                "ports": [{"port": 3000, "protocol": "TCP"}],
                "environmentVariables": [
                  {"name": "NEXT_PUBLIC_API_URL", "value": "http://'${BASE_URL}'-backend.${{ env.AZURE_REGION }}.azurecontainer.io:8000"},
                  {"name": "NODE_ENV", "value": "production"}
                ],
                "resources": {"requests": {"cpu": 1, "memoryInGB": 1}}
              }
            }],
            "imageRegistryCredentials": [{
              "server": "${{ env.REGISTRY }}",
              "username": "${{ secrets.ACR_USERNAME }}",
              "password": "${{ secrets.ACR_PASSWORD }}"
            }],
            "osType": "Linux",
            "ipAddress": {
              "type": "Public",
              "ports": [{"port": 3000, "protocol": "TCP"}],
              "dnsNameLabel": "'${BASE_URL}'-frontend"
            },
            "restartPolicy": "Always"
          }
        }'
        
        deploy_container "${BASE_URL}-frontend" "$FRONTEND_SPEC"
        wait_ready "${BASE_URL}-frontend" 300

  health-check:
    needs: [setup, deploy]
    runs-on: ubuntu-latest
    if: always() && needs.deploy.result == 'success'
    steps:
    - name: Comprehensive Health Check
      env:
        BASE_URL: ${{ needs.setup.outputs.base-url }}
        REGION: ${{ env.AZURE_REGION }}
      run: |
        source azure.sh
        
        echo "🏥 Running health checks..."
        
        # Health check URLs
        REDIS_HOST="${BASE_URL}-redis.${REGION}.azurecontainer.io"
        BACKEND_URL="http://${BASE_URL}-backend.${REGION}.azurecontainer.io:8000"
        FRONTEND_URL="http://${BASE_URL}-frontend.${REGION}.azurecontainer.io:3000"
        
        # Check services
        [ "${{ env.DEPLOY_REDIS }}" = "true" ] && {
          timeout 10 bash -c "</dev/tcp/$REDIS_HOST/6379" && echo "✅ Redis OK" || echo "⚠️ Redis check failed"
        }
        
        [ "${{ env.DEPLOY_BACKEND }}" = "true" ] && health_check "$BACKEND_URL/health/" "Backend"
        [ "${{ env.DEPLOY_FRONTEND }}" = "true" ] && health_check "$FRONTEND_URL" "Frontend"

  cleanup:
    needs: [setup, health-check]
    runs-on: ubuntu-latest
    if: always() && needs.health-check.result == 'success'
    steps:
    - name: Intelligent Cleanup
      env:
        BASE_URL: ${{ needs.setup.outputs.base-url }}
      run: |
        source azure.sh
        
        echo "🧹 Cleaning up old deployments..."
        
        # List all containers
        local containers_url="$API_BASE/subscriptions/$SUB/resourceGroups/$RG/providers/Microsoft.ContainerInstance/containerGroups?api-version=2023-05-01"
        local all_containers=$(api GET "$containers_url" | jq -r '.value[].name' 2>/dev/null | grep "^${{ env.PROJECT_NAME }}-" || true)
        
        # Keep current environment + last 2 deployments per environment
        local current_containers="$BASE_URL-redis $BASE_URL-backend $BASE_URL-frontend"
        local keep_containers=$(echo "$all_containers" | grep -E "(prod|staging|dev)" | sort -r | head -9)
        
        # Delete old containers
        for container in $all_containers; do
          if ! echo "$keep_containers" | grep -q "$container"; then
            echo "🗑️ Deleting old container: $container"
            local delete_url="$API_BASE/subscriptions/$SUB/resourceGroups/$RG/providers/Microsoft.ContainerInstance/containerGroups/$container?api-version=2023-05-01"
            api DELETE "$delete_url" >/dev/null &
          fi
        done
        wait

  notify:
    needs: [setup, deploy, health-check, cleanup]
    runs-on: ubuntu-latest
    if: always()
    steps:
    - name: Deployment Summary
      env:
        BASE_URL: ${{ needs.setup.outputs.base-url }}
        ENV: ${{ needs.setup.outputs.environment }}
        REGION: ${{ env.AZURE_REGION }}
      run: |
        echo "## 🚀 Deployment Summary" >> $GITHUB_STEP_SUMMARY
        echo "| Component | Status | URL |" >> $GITHUB_STEP_SUMMARY
        echo "|-----------|--------|-----|" >> $GITHUB_STEP_SUMMARY
        echo "| Environment | $ENV | - |" >> $GITHUB_STEP_SUMMARY
        
        [ "${{ needs.deploy.result }}" = "success" ] && STATUS="✅ Success" || STATUS="❌ Failed"
        echo "| Deployment | $STATUS | - |" >> $GITHUB_STEP_SUMMARY
        
        if [ "${{ env.DEPLOY_REDIS }}" = "true" ]; then
          echo "| Redis | ✅ Deployed | ${BASE_URL}-redis.${REGION}.azurecontainer.io:6379 |" >> $GITHUB_STEP_SUMMARY
        fi
        
        if [ "${{ env.DEPLOY_BACKEND }}" = "true" ]; then
          echo "| Backend | ✅ Deployed | http://${BASE_URL}-backend.${REGION}.azurecontainer.io:8000 |" >> $GITHUB_STEP_SUMMARY
        fi
        
        if [ "${{ env.DEPLOY_FRONTEND }}" = "true" ]; then
          echo "| Frontend | ✅ Deployed | http://${BASE_URL}-frontend.${REGION}.azurecontainer.io:3000 |" >> $GITHUB_STEP_SUMMARY
        fi
        
        echo "" >> $GITHUB_STEP_SUMMARY
        echo "### 🔗 Quick Links" >> $GITHUB_STEP_SUMMARY
        echo "- 🌐 **App**: http://${BASE_URL}-frontend.${REGION}.azurecontainer.io:3000" >> $GITHUB_STEP_SUMMARY
        echo "- 🔧 **Admin**: http://${BASE_URL}-backend.${REGION}.azurecontainer.io:8000/admin/" >> $GITHUB_STEP_SUMMARY
        echo "- 📊 **API Docs**: http://${BASE_URL}-backend.${REGION}.azurecontainer.io:8000/docs/" >> $GITHUB_STEP_SUMMARY