# Test Backend Deployment Script
# Run this to check if new backend with participation routes is deployed

Write-Host "`n🔍 Testing Backend Deployment...`n" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "1️⃣ Testing /api/health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "https://climax-fullstack.onrender.com/api/health" -Method Get
    Write-Host "   Status: " -NoNewline
    Write-Host $health.status -ForegroundColor Green
    
    if ($health.version) {
        Write-Host "   Version: " -NoNewline
        Write-Host $health.version -ForegroundColor Cyan
    }
    
    if ($health.routes) {
        Write-Host "   Routes: " -NoNewline
        Write-Host "Participation=$($health.routes.participation), Quiz=$($health.routes.quiz)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Failed: $_" -ForegroundColor Red
}

# Test 2: Participation Route (should return 401 or success, not 404)
Write-Host "`n2️⃣ Testing /api/participation route..." -ForegroundColor Yellow
try {
    $participation = Invoke-WebRequest -Uri "https://climax-fullstack.onrender.com/api/participation/admin/contents" -Method Get -UseBasicParsing
    Write-Host "   Status Code: " -NoNewline
    Write-Host $participation.StatusCode -ForegroundColor Green
    if ($participation.StatusCode -eq 401) {
        Write-Host "   ✅ Route exists (401 Unauthorized - expected without token)" -ForegroundColor Green
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "   ✅ Route exists (401 Unauthorized - expected without token)" -ForegroundColor Green
    } elseif ($statusCode -eq 404) {
        Write-Host "   ❌ Route NOT found (404) - Backend not deployed yet!" -ForegroundColor Red
    } else {
        Write-Host "   Status Code: $statusCode" -ForegroundColor Yellow
    }
}

# Test 3: Check if routes are registered
Write-Host "`n3️⃣ Testing specific participation endpoint..." -ForegroundColor Yellow
try {
    # Try a specific content ID (this should return 401 or 400, not 404)
    $testId = "6893918c648a3c2250ddad1b"
    $url = "https://climax-fullstack.onrender.com/api/participation/user/$testId/questions"
    $response = Invoke-WebRequest -Uri $url -Method Get -UseBasicParsing
    Write-Host "   ✅ Endpoint exists! Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 404) {
        Write-Host "   ❌ Endpoint NOT found (404) - Routes not registered!" -ForegroundColor Red
        Write-Host "   Wait a few more minutes for Render to deploy..." -ForegroundColor Yellow
    } elseif ($statusCode -eq 400 -or $statusCode -eq 401) {
        Write-Host "   ✅ Endpoint exists! (Got $statusCode - route is working)" -ForegroundColor Green
    } else {
        Write-Host "   Status: $statusCode" -ForegroundColor Yellow
    }
}

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "   - If you see version '2.0-participation-enabled', backend is UPDATED ✅" -ForegroundColor White
Write-Host "   - If routes show 404, wait 2-3 more minutes and run this script again" -ForegroundColor White
Write-Host "   - If routes show 401/400, participation is WORKING ✅`n" -ForegroundColor White
