# PowerShell deployment script for AWS
# Profile: longhl104, Region: ap-southeast-2

param(
  [Parameter(Mandatory = $false)]
  [string]$Profile = "longhl104",
    
  [Parameter(Mandatory = $false)]
  [string]$Region = "ap-southeast-2",
    
  [Parameter(Mandatory = $false)]
  [string]$ClusterName = "romantic-game-cluster",
    
  [Parameter(Mandatory = $false)]
  [string]$ServiceName = "romantic-game-service",
    
  [Parameter(Mandatory = $false)]
  [string]$RepositoryName = "romantic-love-game"
)

Write-Host "Starting deployment of Romantic Love Game to AWS..." -ForegroundColor Magenta

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
Write-Host "Getting AWS Account ID..." -ForegroundColor Yellow
$AccountId = aws sts get-caller-identity --profile $Profile --query Account --output text

if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to get AWS Account ID. Please check your AWS profile configuration."
  exit 1
}

Write-Host "Using AWS Account: $AccountId" -ForegroundColor Green

# ECR Repository URI
$ECRRepository = "$AccountId.dkr.ecr.$Region.amazonaws.com/$RepositoryName"

# Step 1: Create ECR repository if it doesn't exist
Write-Host "Creating ECR repository if needed..." -ForegroundColor Yellow
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
Write-Host "Logging in to ECR..." -ForegroundColor Yellow
aws ecr get-login-password --region $Region --profile $Profile | docker login --username AWS --password-stdin $ECRRepository

if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to login to ECR."
  exit 1
}

# Step 3: Build Docker image
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker build -t $RepositoryName .

if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to build Docker image."
  exit 1
}

# Step 4: Tag and push image
Write-Host "Tagging and pushing image to ECR..." -ForegroundColor Yellow
docker tag "${RepositoryName}:latest" "${ECRRepository}:latest"
docker push "${ECRRepository}:latest"

if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to push image to ECR."
  exit 1
}

# Step 5: Create ECS cluster if it doesn't exist
Write-Host "Setting up ECS cluster..." -ForegroundColor Yellow

# Check if cluster exists by looking for active clusters
$ClusterInfo = aws ecs describe-clusters --clusters $ClusterName --region $Region --profile $Profile --query "clusters[?status=='ACTIVE']" --output json 2>$null

if ($LASTEXITCODE -ne 0 -or $ClusterInfo -eq "[]") {
  Write-Host "Creating ECS cluster..." -ForegroundColor Blue
  
  # Create the cluster
  aws ecs create-cluster --cluster-name $ClusterName --region $Region --profile $Profile
  
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create ECS cluster."
    exit 1
  }
  
  # Wait for cluster to be active
  Write-Host "Waiting for cluster to be ready..." -ForegroundColor Yellow
  Start-Sleep -Seconds 10
  
  # Verify cluster was created successfully
  $VerifyCluster = aws ecs describe-clusters --clusters $ClusterName --region $Region --profile $Profile --query "clusters[?status=='ACTIVE']" --output json
  if ($VerifyCluster -eq "[]") {
    Write-Error "Cluster creation failed - cluster not found in active state."
    exit 1
  }
  
  Write-Host "ECS cluster created successfully." -ForegroundColor Green
}
else {
  Write-Host "ECS cluster already exists." -ForegroundColor Green
}

# Step 6: Create task definition
Write-Host "Creating ECS task definition..." -ForegroundColor Yellow

# Create CloudWatch log group
aws logs create-log-group --log-group-name "/ecs/romantic-game" --region $Region --profile $Profile 2>$null

# Check if ecsTaskExecutionRole exists, create if needed
Write-Host "Checking ECS task execution role..." -ForegroundColor Yellow
$ExecutionRoleArn = "arn:aws:iam::${AccountId}:role/ecsTaskExecutionRole"
aws iam get-role --role-name ecsTaskExecutionRole --profile $Profile 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Creating ECS task execution role..." -ForegroundColor Blue
  
  # Create the role
  aws iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document "{`"Version`":`"2012-10-17`",`"Statement`":[{`"Effect`":`"Allow`",`"Principal`":{`"Service`":`"ecs-tasks.amazonaws.com`"},`"Action`":`"sts:AssumeRole`"}]}" --profile $Profile
  
  # Attach the managed policy
  aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy --profile $Profile
  
  Write-Host "ECS task execution role created successfully." -ForegroundColor Green
}

# Create task definition JSON file with proper formatting
Write-Host "Registering task definition..." -ForegroundColor Blue
Write-Host "Account ID: $AccountId" -ForegroundColor Cyan
Write-Host "ECR Repository: $ECRRepository" -ForegroundColor Cyan

# Build JSON string with explicit variable substitution
$ImageUri = "${ECRRepository}:latest"

# Validate required variables
if ([string]::IsNullOrEmpty($AccountId)) {
  Write-Error "Account ID is empty. Cannot proceed."
  exit 1
}

if ([string]::IsNullOrEmpty($ECRRepository)) {
  Write-Error "ECR Repository URI is empty. Cannot proceed."
  exit 1
}

# Register task definition using individual parameters to avoid JSON parsing issues
aws ecs register-task-definition `
  --family "romantic-game-task" `
  --network-mode "awsvpc" `
  --requires-compatibilities "FARGATE" `
  --cpu "256" `
  --memory "512" `
  --execution-role-arn "$ExecutionRoleArn" `
  --container-definitions "name=romantic-game-container,image=$ImageUri,portMappings=[{containerPort=80,protocol=tcp}],essential=true,logConfiguration={logDriver=awslogs,options={awslogs-group=/ecs/romantic-game,awslogs-region=$Region,awslogs-stream-prefix=ecs}}" `
  --region $Region `
  --profile $Profile

if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to register task definition."
  exit 1
}

# Step 7: Create or update ECS service
Write-Host "Creating/updating ECS service..." -ForegroundColor Yellow

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
}
else {
  # Security group might already exist, get its ID
  $SecurityGroupId = aws ec2 describe-security-groups --filters "Name=group-name,Values=romantic-game-sg" --query "SecurityGroups[0].GroupId" --output text --region $Region --profile $Profile
}

# Convert subnet IDs to comma-separated format for CLI
$SubnetList = ($SubnetIds -split "`t") -join ","

Write-Host "Using subnets: $SubnetList" -ForegroundColor Cyan
Write-Host "Using security group: $SecurityGroupId" -ForegroundColor Cyan

# Check if service exists by looking for active services
$ServiceInfo = aws ecs describe-services --cluster $ClusterName --services $ServiceName --region $Region --profile $Profile --query "services[?status=='ACTIVE']" --output json 2>$null

if ($LASTEXITCODE -eq 0 -and $ServiceInfo -ne "[]") {
  Write-Host "Updating existing service..." -ForegroundColor Blue
  aws ecs update-service --cluster $ClusterName --service $ServiceName --task-definition "romantic-game-task" --region $Region --profile $Profile
}
else {
  Write-Host "Creating new service..." -ForegroundColor Blue
  
  # Create service using direct CLI parameters
  aws ecs create-service `
    --cluster $ClusterName `
    --service-name $ServiceName `
    --task-definition "romantic-game-task" `
    --desired-count 1 `
    --launch-type "FARGATE" `
    --network-configuration "awsvpcConfiguration={subnets=[$SubnetList],securityGroups=[$SecurityGroupId],assignPublicIp=ENABLED}" `
    --region $Region `
    --profile $Profile
    
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create ECS service."
    exit 1
  }
}

# Step 8: Wait for service to stabilize
Write-Host "Waiting for service to stabilize..." -ForegroundColor Yellow
aws ecs wait services-stable --cluster $ClusterName --services $ServiceName --region $Region --profile $Profile

# Step 9: Get service endpoint
Write-Host "Getting service endpoint..." -ForegroundColor Yellow
$TaskArn = aws ecs list-tasks --cluster $ClusterName --service-name $ServiceName --region $Region --profile $Profile --query "taskArns[0]" --output text

if (![string]::IsNullOrEmpty($TaskArn) -and $TaskArn -ne "None") {
  $NetworkInterfaceQuery = 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value | [0]'
  $PublicIP = aws ecs describe-tasks --cluster $ClusterName --tasks $TaskArn --region $Region --profile $Profile --query $NetworkInterfaceQuery --output text
    
  if (![string]::IsNullOrEmpty($PublicIP)) {
    $NetworkInterfaceQuery2 = 'NetworkInterfaces[0].Association.PublicIp'
    $PublicIP = aws ec2 describe-network-interfaces --network-interface-ids $PublicIP --region $Region --profile $Profile --query $NetworkInterfaceQuery2 --output text
        
    if (![string]::IsNullOrEmpty($PublicIP) -and $PublicIP -ne "None") {
      Write-Host "Deployment successful!" -ForegroundColor Green
      Write-Host "Your romantic game is available at: http://$PublicIP" -ForegroundColor Cyan
      Write-Host "Happy International Women's Day!" -ForegroundColor Magenta
    }
  }
}

# Cleanup temporary files
Remove-Item -Path "task-definition.json" -ErrorAction SilentlyContinue
Remove-Item -Path "service-config.json" -ErrorAction SilentlyContinue

Write-Host "Deployment process completed!" -ForegroundColor Green
Write-Host "You can check the service status in AWS ECS Console" -ForegroundColor Yellow