# PowerShell deployment script for AWS
# Profile: longhl104, Region: ap-southeast-2

param(
    [Parameter(Mandatory=$false)]
    [string]$Profile = "longhl104",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "ap-southeast-2",
    
    [Parameter(Mandatory=$false)]
    [string]$ClusterName = "romantic-game-cluster",
    
    [Parameter(Mandatory=$false)]
    [string]$ServiceName = "romantic-game-service",
    
    [Parameter(Mandatory=$false)]
    [string]$RepositoryName = "romantic-love-game"
)

Write-Host "🎮 Starting deployment of Romantic Love Game to AWS..." -ForegroundColor Magenta

# Check if AWS CLI is installed
if (!(Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Error "AWS CLI is not installed. Please install it first."
    exit 1
}

# Check if Docker is running
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed or not running. Please install Docker first."
    exit 1
}

# Get AWS Account ID
Write-Host "📋 Getting AWS Account ID..." -ForegroundColor Yellow
$AccountId = aws sts get-caller-identity --profile $Profile --query Account --output text

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to get AWS Account ID. Please check your AWS profile configuration."
    exit 1
}

Write-Host "✅ Using AWS Account: $AccountId" -ForegroundColor Green

# ECR Repository URI
$ECRRepository = "$AccountId.dkr.ecr.$Region.amazonaws.com/$RepositoryName"

# Step 1: Create ECR repository if it doesn't exist
Write-Host "🏗️ Creating ECR repository if needed..." -ForegroundColor Yellow
aws ecr describe-repositories --repository-names $RepositoryName --region $Region --profile $Profile 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating ECR repository..." -ForegroundColor Blue
    aws ecr create-repository --repository-name $RepositoryName --region $Region --profile $Profile
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to create ECR repository."
        exit 1
    }
}

# Step 2: Login to ECR
Write-Host "🔐 Logging in to ECR..." -ForegroundColor Yellow
aws ecr get-login-password --region $Region --profile $Profile | docker login --username AWS --password-stdin $ECRRepository

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to login to ECR."
    exit 1
}

# Step 3: Build Docker image
Write-Host "🐳 Building Docker image..." -ForegroundColor Yellow
docker build -t $RepositoryName .

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to build Docker image."
    exit 1
}

# Step 4: Tag and push image
Write-Host "🚀 Tagging and pushing image to ECR..." -ForegroundColor Yellow
docker tag "${RepositoryName}:latest" "${ECRRepository}:latest"
docker push "${ECRRepository}:latest"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to push image to ECR."
    exit 1
}

# Step 5: Create ECS cluster if it doesn't exist
Write-Host "🏗️ Setting up ECS cluster..." -ForegroundColor Yellow
aws ecs describe-clusters --clusters $ClusterName --region $Region --profile $Profile 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating ECS cluster..." -ForegroundColor Blue
    aws ecs create-cluster --cluster-name $ClusterName --capacity-providers FARGATE --region $Region --profile $Profile
}

# Step 6: Create task definition
Write-Host "📝 Creating ECS task definition..." -ForegroundColor Yellow
$TaskDefinition = @{
    family = "romantic-game-task"
    networkMode = "awsvpc"
    requiresCompatibilities = @("FARGATE")
    cpu = "256"
    memory = "512"
    executionRoleArn = "arn:aws:iam::${AccountId}:role/ecsTaskExecutionRole"
    containerDefinitions = @(
        @{
            name = "romantic-game-container"
            image = "${ECRRepository}:latest"
            portMappings = @(
                @{
                    containerPort = 80
                    protocol = "tcp"
                }
            )
            essential = $true
            logConfiguration = @{
                logDriver = "awslogs"
                options = @{
                    "awslogs-group" = "/ecs/romantic-game"
                    "awslogs-region" = $Region
                    "awslogs-stream-prefix" = "ecs"
                }
            }
        }
    )
} | ConvertTo-Json -Depth 10

# Create CloudWatch log group
aws logs create-log-group --log-group-name "/ecs/romantic-game" --region $Region --profile $Profile 2>$null

# Register task definition
$TaskDefinition | Out-File -FilePath "task-definition.json" -Encoding UTF8
aws ecs register-task-definition --cli-input-json file://task-definition.json --region $Region --profile $Profile

# Step 7: Create or update ECS service
Write-Host "🎯 Creating/updating ECS service..." -ForegroundColor Yellow

# Get default VPC and subnets
$VpcId = aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query "Vpcs[0].VpcId" --output text --region $Region --profile $Profile
$SubnetIds = aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VpcId" --query "Subnets[*].SubnetId" --output text --region $Region --profile $Profile

if ([string]::IsNullOrEmpty($VpcId) -or [string]::IsNullOrEmpty($SubnetIds)) {
    Write-Error "Could not find default VPC or subnets. Please create them manually."
    exit 1
}

# Create security group for the service
$SecurityGroupId = aws ec2 create-security-group --group-name "romantic-game-sg" --description "Security group for romantic game" --vpc-id $VpcId --region $Region --profile $Profile --query "GroupId" --output text 2>$null

if ($LASTEXITCODE -eq 0) {
    # Add inbound rule for HTTP
    aws ec2 authorize-security-group-ingress --group-id $SecurityGroupId --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $Region --profile $Profile
} else {
    # Security group might already exist, get its ID
    $SecurityGroupId = aws ec2 describe-security-groups --filters "Name=group-name,Values=romantic-game-sg" --query "SecurityGroups[0].GroupId" --output text --region $Region --profile $Profile
}

# Create service configuration
$ServiceConfig = @{
    serviceName = $ServiceName
    cluster = $ClusterName
    taskDefinition = "romantic-game-task"
    desiredCount = 1
    launchType = "FARGATE"
    networkConfiguration = @{
        awsvpcConfiguration = @{
            subnets = $SubnetIds -split "`t"
            securityGroups = @($SecurityGroupId)
            assignPublicIp = "ENABLED"
        }
    }
} | ConvertTo-Json -Depth 10

# Check if service exists
aws ecs describe-services --cluster $ClusterName --services $ServiceName --region $Region --profile $Profile 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Updating existing service..." -ForegroundColor Blue
    aws ecs update-service --cluster $ClusterName --service $ServiceName --task-definition "romantic-game-task" --region $Region --profile $Profile
} else {
    Write-Host "Creating new service..." -ForegroundColor Blue
    $ServiceConfig | Out-File -FilePath "service-config.json" -Encoding UTF8
    aws ecs create-service --cli-input-json file://service-config.json --region $Region --profile $Profile
}

# Step 8: Wait for service to stabilize
Write-Host "⏳ Waiting for service to stabilize..." -ForegroundColor Yellow
aws ecs wait services-stable --cluster $ClusterName --services $ServiceName --region $Region --profile $Profile

# Step 9: Get service endpoint
Write-Host "🌐 Getting service endpoint..." -ForegroundColor Yellow
$TaskArn = aws ecs list-tasks --cluster $ClusterName --service-name $ServiceName --region $Region --profile $Profile --query "taskArns[0]" --output text

if (![string]::IsNullOrEmpty($TaskArn) -and $TaskArn -ne "None") {
    $PublicIP = aws ecs describe-tasks --cluster $ClusterName --tasks $TaskArn --region $Region --profile $Profile --query "tasks[0].attachments[0].details[?name=='networkInterfaceId'].value | [0]" --output text
    
    if (![string]::IsNullOrEmpty($PublicIP)) {
        $PublicIP = aws ec2 describe-network-interfaces --network-interface-ids $PublicIP --region $Region --profile $Profile --query "NetworkInterfaces[0].Association.PublicIp" --output text
        
        if (![string]::IsNullOrEmpty($PublicIP) -and $PublicIP -ne "None") {
            Write-Host "🎉 Deployment successful!" -ForegroundColor Green
            Write-Host "🌍 Your romantic game is available at: http://$PublicIP" -ForegroundColor Cyan
            Write-Host "💕 Happy International Women's Day!" -ForegroundColor Magenta
        }
    }
}

# Cleanup temporary files
Remove-Item -Path "task-definition.json" -ErrorAction SilentlyContinue
Remove-Item -Path "service-config.json" -ErrorAction SilentlyContinue

Write-Host "✨ Deployment process completed!" -ForegroundColor Green
Write-Host "📊 You can check the service status in AWS ECS Console" -ForegroundColor Yellow