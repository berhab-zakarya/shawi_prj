#!/bin/bash
set -e

echo "🚀 Deploying Elshawi Legal Platform to Azure"

# Variables (update these)
RESOURCE_GROUP="elshawi-rg"
ACR_NAME="elshawiacr"
LOCATION="westeurope"
BACKEND_IMAGE="elshawi-backend"
FRONTEND_IMAGE="elshawi-frontend"
REDIS_NAME="elshawi-redis"

# Step 1: Create Azure Cache for Redis
echo "📦 Creating Azure Cache for Redis..."
az redis create \
    --resource-group $RESOURCE_GROUP \
    --name $REDIS_NAME \
    --location $LOCATION \
    --sku Basic \
    --vm-size c0 \
    --enable-non-ssl-port

# Get Redis connection info
echo "🔑 Getting Redis connection details..."
REDIS_KEY=$(az redis list-keys --resource-group $RESOURCE_GROUP --name $REDIS_NAME --query primaryKey --output tsv)
REDIS_HOST="$REDIS_NAME.redis.cache.windows.net"
echo "Redis Host: $REDIS_HOST"
echo "Redis Key: $REDIS_KEY"

# Step 2: Build and push backend image
echo "🏗️ Building backend image..."
cd backend
docker build -f ../azure-backend.dockerfile -t $ACR_NAME.azurecr.io/$BACKEND_IMAGE:latest .
docker push $ACR_NAME.azurecr.io/$BACKEND_IMAGE:latest
cd ..

# Step 3: Build and push frontend image  
echo "🏗️ Building frontend image..."
cd frontend
docker build -f Dockerfile.prod -t $ACR_NAME.azurecr.io/$FRONTEND_IMAGE:latest .
docker push $ACR_NAME.azurecr.io/$FRONTEND_IMAGE:latest
cd ..

# Step 4: Create Container Instance for Backend
echo "🚀 Creating backend container instance..."
az container create \
    --resource-group $RESOURCE_GROUP \
    --name elshawi-backend \
    --image $ACR_NAME.azurecr.io/$BACKEND_IMAGE:latest \
    --registry-login-server $ACR_NAME.azurecr.io \
    --registry-username $ACR_NAME \
    --registry-password $(az acr credential show --name $ACR_NAME --query passwords[0].value --output tsv) \
    --dns-name-label elshawi-backend \
    --ports 8000 \
    --cpu 1 \
    --memory 2 \
    --environment-variables \
        DEBUG=False \
        SECRET_KEY=your-super-secret-key-change-this \
        ALLOWED_HOSTS="*" \
        REDIS_URL="redis://$REDIS_HOST:6380/0?ssl=true&password=$REDIS_KEY" \
        DATABASE_URL="sqlite:///db.sqlite3" \
    --location $LOCATION

# Step 5: Create Container Instance for Frontend
echo "🚀 Creating frontend container instance..."
az container create \
    --resource-group $RESOURCE_GROUP \
    --name elshawi-frontend \
    --image $ACR_NAME.azurecr.io/$FRONTEND_IMAGE:latest \
    --registry-login-server $ACR_NAME.azurecr.io \
    --registry-username $ACR_NAME \
    --registry-password $(az acr credential show --name $ACR_NAME --query passwords[0].value --output tsv) \
    --dns-name-label elshawi-frontend \
    --ports 3000 \
    --cpu 0.5 \
    --memory 1 \
    --environment-variables \
        NODE_ENV=production \
        NEXT_PUBLIC_API_URL="http://elshawi-backend.westeurope.azurecontainer.io:8000" \
    --location $LOCATION

# Step 6: Get container URLs
echo "✅ Deployment completed!"
echo "Backend URL: http://elshawi-backend.westeurope.azurecontainer.io:8000"
echo "Frontend URL: http://elshawi-frontend.westeurope.azurecontainer.io:3000"
echo "Redis Host: $REDIS_HOST"

echo "🔧 Next steps:"
echo "1. Update your frontend environment to point to the backend URL"
echo "2. Configure your domain DNS to point to these URLs"
echo "3. Set up SSL certificates if needed"