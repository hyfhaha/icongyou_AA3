require('dotenv').config();
const path = require('path');
const fs = require('fs');
const OSS = require('ali-oss');

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// OSS 配置
const ossConfig = {
  region: process.env.OSS_REGION || process.env.ALIYUN_OSS_REGION || 'oss-cn-beijing',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID || process.env.ALIYUN_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || process.env.ALIYUN_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET || process.env.ALIYUN_OSS_BUCKET
};

// 检查配置
if (!ossConfig.accessKeyId || !ossConfig.accessKeySecret || !ossConfig.bucket) {
  console.error(`${colors.red}❌ 错误: OSS 配置缺失！${colors.reset}`);
  console.error(`请在 .env 文件中配置以下环境变量:`);
  console.error(`  - ALIYUN_ACCESS_KEY_ID`);
  console.error(`  - ALIYUN_ACCESS_KEY_SECRET`);
  console.error(`  - OSS_BUCKET`);
  console.error(`  - OSS_REGION (可选，默认为 oss-cn-beijing)`);
  process.exit(1);
}

// 初始化 OSS 客户端
const ossClient = new OSS(ossConfig);
const uploadsRoot = path.join(__dirname, 'uploads');

// 存储上传结果
const uploadResults = {
  success: [],
  failed: [],
  skipped: []
};

/**
 * 递归获取所有文件
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

/**
 * 上传单个文件到 OSS
 */
async function uploadFile(filePath) {
  try {
    // 计算相对于 uploads 根目录的相对路径
    const relativePath = path.relative(uploadsRoot, filePath);
    // 统一使用正斜杠（OSS 要求）
    const objectName = relativePath.split(path.sep).join('/');
    
    // 获取文件信息
    const stats = fs.statSync(filePath);
    const fileSize = (stats.size / 1024).toFixed(2); // KB

    console.log(`${colors.blue}[上传中]${colors.reset} ${relativePath} (${fileSize} KB)...`);

    // 上传到 OSS
    const result = await ossClient.put(objectName, filePath);
    
    // 转换为 HTTPS
    let url = result.url;
    if (url.startsWith('http://')) {
      url = url.replace('http://', 'https://');
    }

    return {
      success: true,
      localPath: relativePath,
      objectName: objectName,
      url: url,
      size: stats.size
    };
  } catch (error) {
    return {
      success: false,
      localPath: path.relative(uploadsRoot, filePath),
      error: error.message
    };
  }
}

/**
 * 主函数
 */
async function main() {
  console.log(`${colors.blue}════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  批量上传文件到阿里云 OSS${colors.reset}`);
  console.log(`${colors.blue}════════════════════════════════════════════════════${colors.reset}\n`);

  // 检查 uploads 目录是否存在
  if (!fs.existsSync(uploadsRoot)) {
    console.error(`${colors.red}❌ uploads 目录不存在！${colors.reset}`);
    process.exit(1);
  }

  // 指定要上传的文件夹
  const targetFolders = ['homeworks', 'images', 'materials'];
  
  // 获取指定文件夹中的所有文件
  console.log(`${colors.yellow}[扫描]${colors.reset} 正在扫描指定文件夹...`);
  console.log(`${colors.blue}目标文件夹: ${targetFolders.join(', ')}${colors.reset}\n`);
  
  let allFiles = [];
  
  targetFolders.forEach(folderName => {
    const folderPath = path.join(uploadsRoot, folderName);
    if (fs.existsSync(folderPath)) {
      const folderFiles = getAllFiles(folderPath);
      allFiles = allFiles.concat(folderFiles);
      console.log(`${colors.green}✓${colors.reset} ${folderName}/: 找到 ${folderFiles.length} 个文件`);
    } else {
      console.log(`${colors.yellow}⚠${colors.reset} ${folderName}/: 文件夹不存在，跳过`);
    }
  });
  
  // 过滤掉 .gitignore 等隐藏文件
  const validFiles = allFiles.filter(file => {
    const fileName = path.basename(file);
    return !fileName.startsWith('.') && fileName !== 'README.md';
  });

  console.log(`\n${colors.green}✓${colors.reset} 总计找到 ${validFiles.length} 个文件\n`);

  if (validFiles.length === 0) {
    console.log(`${colors.yellow}⚠ 没有找到需要上传的文件${colors.reset}`);
    return;
  }

  // 显示要上传的文件列表
  console.log(`${colors.blue}待上传文件列表:${colors.reset}`);
  validFiles.forEach((file, index) => {
    const relativePath = path.relative(uploadsRoot, file);
    console.log(`  ${index + 1}. ${relativePath}`);
  });
  console.log('');

  // 确认是否继续
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise(resolve => {
    rl.question(`${colors.yellow}是否继续上传？(y/n): ${colors.reset}`, resolve);
  });
  rl.close();

  if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
    console.log(`${colors.yellow}已取消上传${colors.reset}`);
    return;
  }

  console.log(`\n${colors.blue}开始上传...${colors.reset}\n`);

  // 逐个上传文件
  for (let i = 0; i < validFiles.length; i++) {
    const file = validFiles[i];
    const result = await uploadFile(file);

    if (result.success) {
      uploadResults.success.push(result);
      console.log(`${colors.green}✓ [成功]${colors.reset} ${result.localPath}`);
      console.log(`   URL: ${result.url}\n`);
    } else {
      uploadResults.failed.push(result);
      console.log(`${colors.red}✗ [失败]${colors.reset} ${result.localPath}`);
      console.log(`   错误: ${result.error}\n`);
    }

    // 添加短暂延迟，避免请求过快
    if (i < validFiles.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // 显示统计信息
  console.log(`\n${colors.blue}════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  上传完成统计${colors.reset}`);
  console.log(`${colors.blue}════════════════════════════════════════════════════${colors.reset}\n`);
  console.log(`${colors.green}✓ 成功: ${uploadResults.success.length} 个文件${colors.reset}`);
  if (uploadResults.failed.length > 0) {
    console.log(`${colors.red}✗ 失败: ${uploadResults.failed.length} 个文件${colors.reset}`);
  }

  // 生成结果文件
  const resultFilePath = path.join(__dirname, 'upload_results.json');
  const results = {
    timestamp: new Date().toISOString(),
    total: validFiles.length,
    success: uploadResults.success.length,
    failed: uploadResults.failed.length,
    files: {
      success: uploadResults.success.map(r => ({
        localPath: r.localPath,
        objectName: r.objectName,
        url: r.url,
        size: r.size
      })),
      failed: uploadResults.failed
    }
  };

  fs.writeFileSync(resultFilePath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n${colors.green}✓ 上传结果已保存到: upload_results.json${colors.reset}`);

  // 生成 URL 映射文件 (便于查看和更新数据库)
  const mappingFilePath = path.join(__dirname, 'oss_url_mapping.txt');
  let mappingContent = '# 本地文件路径 -> OSS URL 映射表\n';
  mappingContent += '# 生成时间: ' + new Date().toLocaleString('zh-CN') + '\n';
  mappingContent += '# ==========================================\n\n';
  
  uploadResults.success.forEach(result => {
    mappingContent += `${result.localPath}\n`;
    mappingContent += `→ ${result.url}\n\n`;
  });
  
  fs.writeFileSync(mappingFilePath, mappingContent, 'utf-8');
  console.log(`${colors.green}✓ URL 映射表已保存到: oss_url_mapping.txt${colors.reset}`);

  // 显示所有成功的 URL
  if (uploadResults.success.length > 0) {
    console.log(`\n${colors.blue}════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.blue}  所有文件的 OSS URL${colors.reset}`);
    console.log(`${colors.blue}════════════════════════════════════════════════════${colors.reset}\n`);
    
    uploadResults.success.forEach(result => {
      console.log(`${colors.green}${result.localPath}${colors.reset}`);
      console.log(`  → ${result.url}\n`);
    });
  }

  // 询问是否删除本地文件
  const rl2 = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const deleteAnswer = await new Promise(resolve => {
    rl2.question(`\n${colors.yellow}是否删除已成功上传的本地文件？(y/n): ${colors.reset}`, resolve);
  });
  rl2.close();

  if (deleteAnswer.toLowerCase() === 'y' || deleteAnswer.toLowerCase() === 'yes') {
    console.log(`\n${colors.yellow}[删除]${colors.reset} 正在删除本地文件...`);
    let deletedCount = 0;
    
    uploadResults.success.forEach(result => {
      const fullPath = path.join(uploadsRoot, result.localPath);
      try {
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          deletedCount++;
        }
      } catch (error) {
        console.error(`${colors.red}✗ 删除失败: ${result.localPath} - ${error.message}${colors.reset}`);
      }
    });

    console.log(`${colors.green}✓ 已删除 ${deletedCount} 个本地文件${colors.reset}`);
  }

  console.log(`\n${colors.green}✅ 所有操作完成！${colors.reset}`);
}

// 运行主函数
main().catch(error => {
  console.error(`${colors.red}❌ 发生错误:${colors.reset}`, error);
  process.exit(1);
});

