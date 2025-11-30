# =========================================
# AI 接口测试脚本（PowerShell）
# 使用方法：在 PowerShell 中执行：.\test_ai.ps1
# =========================================

# 设置控制台输出编码为 UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$baseUrl = "http://localhost:3000"
$username = "student01"
$password = "123456"

# 辅助函数：将对象转换为 UTF-8 编码的字节数组
function ConvertTo-Utf8Json {
    param($Object)
    $json = $Object | ConvertTo-Json -Compress
    return [System.Text.Encoding]::UTF8.GetBytes($json)
}

Write-Host "=== 步骤1：登录获取 Token ===" -ForegroundColor Green
$loginBodyObj = @{
    username = $username
    password = $password
}
$loginBodyBytes = ConvertTo-Utf8Json $loginBodyObj

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -ContentType "application/json; charset=utf-8" `
        -Body $loginBodyBytes
    
    $token = $loginResponse.token
    Write-Host "✓ 登录成功，Token: $($token.Substring(0, 20))..." -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ 登录失败: $_" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "=== 步骤2：测试 AI 问答接口 /api/ai/ask ===" -ForegroundColor Green
# 构建JSON对象，然后转换为UTF-8编码的字节数组
$askBodyObj = @{
    question = "请帮我介绍一下软件工程实践这门课"
    storyId = 1001
}
$askBodyBytes = ConvertTo-Utf8Json $askBodyObj
$askBodyJson = [System.Text.Encoding]::UTF8.GetString($askBodyBytes)
Write-Host "发送的请求体: $askBodyJson" -ForegroundColor Cyan

try {
    $askResponse = Invoke-RestMethod -Uri "$baseUrl/api/ai/ask" `
        -Method POST `
        -Headers $headers `
        -Body $askBodyBytes `
        -ContentType "application/json; charset=utf-8"
    
    Write-Host "✓ 问答接口调用成功！" -ForegroundColor Green
    Write-Host "AI 回复：" -ForegroundColor Yellow
    Write-Host $askResponse.answer -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "✗ 问答接口调用失败: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "错误详情: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "=== 步骤3：测试 AI 写作优化接口 /api/ai/generate ===" -ForegroundColor Green
$generateBodyObj = @{
    content = "这是我写的一段课程介绍，请帮我优化一下。软件工程实践是一门重要的课程，它教我们如何开发软件。"
    requirements = "分点列出，风格正式"
    storyId = 1001
}
$generateBodyBytes = ConvertTo-Utf8Json $generateBodyObj

try {
    $generateResponse = Invoke-RestMethod -Uri "$baseUrl/api/ai/generate" `
        -Method POST `
        -Headers $headers `
        -Body $generateBodyBytes `
        -ContentType "application/json; charset=utf-8"
    
    Write-Host "✓ 写作优化接口调用成功！" -ForegroundColor Green
    Write-Host "优化后的内容：" -ForegroundColor Yellow
    Write-Host $generateResponse.result -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "✗ 写作优化接口调用失败: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "错误详情: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "=== 步骤4：测试 AI 摘要接口 /api/ai/summary ===" -ForegroundColor Green
$summaryBodyObj = @{
    content = "软件工程实践是一门综合性很强的课程。它涵盖了需求分析、系统设计、编码实现、测试部署等软件开发的各个环节。通过这门课程，学生可以学习到如何团队协作、如何撰写技术文档、如何使用版本控制工具等实用技能。课程通常采用项目驱动的方式，让学生在实际项目中应用所学知识。"
    max_length = 100
    storyId = 1001
}
$summaryBodyBytes = ConvertTo-Utf8Json $summaryBodyObj

try {
    $summaryResponse = Invoke-RestMethod -Uri "$baseUrl/api/ai/summary" `
        -Method POST `
        -Headers $headers `
        -Body $summaryBodyBytes `
        -ContentType "application/json; charset=utf-8"
    
    Write-Host "✓ 摘要接口调用成功！" -ForegroundColor Green
    Write-Host "摘要内容：" -ForegroundColor Yellow
    Write-Host $summaryResponse.summary -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "✗ 摘要接口调用失败: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "错误详情: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "=== 步骤5：测试 AI 点评接口 /api/ai/comment ===" -ForegroundColor Green
$commentBodyObj = @{
    content = "我完成了需求分析文档，包括用例图和ER图。用例图描述了系统的主要功能，ER图展示了数据库设计。"
    rubric = "重点关注文档的完整性和规范性"
    storyId = 1001
}
$commentBodyBytes = ConvertTo-Utf8Json $commentBodyObj

try {
    $commentResponse = Invoke-RestMethod -Uri "$baseUrl/api/ai/comment" `
        -Method POST `
        -Headers $headers `
        -Body $commentBodyBytes `
        -ContentType "application/json; charset=utf-8"
    
    Write-Host "✓ 点评接口调用成功！" -ForegroundColor Green
    Write-Host "AI 点评：" -ForegroundColor Yellow
    Write-Host $commentResponse.comment -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "✗ 点评接口调用失败: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "错误详情: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "=== 所有测试完成 ===" -ForegroundColor Green

