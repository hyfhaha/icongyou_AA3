# 任务资料测试文件说明

## 文件类型要求

任务资料仅支持以下文件格式：
- ✅ **PDF** (`.pdf`)
- ✅ **DOC** (`.doc`)
- ✅ **DOCX** (`.docx`)

## 创建测试文件的方法

### 方法一：使用 Microsoft Word

1. 打开 Microsoft Word
2. 创建新文档，输入测试内容（例如："这是任务资料测试文件"）
3. 保存为以下格式之一：
   - **PDF格式**：文件 → 另存为 → 选择 "PDF (*.pdf)"
   - **DOC格式**：文件 → 另存为 → 选择 "Word 97-2003 文档 (*.doc)"
   - **DOCX格式**：文件 → 另存为 → 选择 "Word 文档 (*.docx)"

### 方法二：使用在线工具

1. 访问 [Google 文档](https://docs.google.com/document/)
2. 创建新文档并输入测试内容
3. 下载为 PDF 或 DOCX 格式

### 方法三：使用命令行工具（需要安装相应工具）

#### 创建 PDF（使用 wkhtmltopdf）
```bash
echo "这是测试PDF文件" | wkhtmltopdf - test_material.pdf
```

#### 创建 DOC（使用 pandoc）
```bash
echo "# 测试文档" | pandoc -o test_material.doc
```

## 测试文件命名建议

建议使用有意义的文件名，例如：
- `需求分析报告模板.pdf`
- `任务说明文档.doc`
- `开发规范.docx`
- `测试用例模板.pdf`

## 上传测试

使用以下 API 上传测试文件：

```bash
POST /api/upload/material
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <选择PDF或DOC/DOCX文件>
```

## 注意事项

1. 文件大小限制：100MB
2. 文件类型验证：后端会严格检查文件扩展名和MIME类型
3. 上传成功后，返回的URL可以存储到 `course_map_story_material.content` 字段

