# Facebook Post - Codebaxing

---

**Vừa release một tool nhỏ cho anh em dev: Codebaxing**

Bạn có bao giờ muốn hỏi AI: "Tìm code xử lý authentication" mà không cần nhớ chính xác tên function hay file?

Codebaxing giúp bạn làm điều đó - semantic search cho codebase, tích hợp trực tiếp vào Claude Desktop.

**Cách hoạt động:**
```
Query: "user authentication"
    ↓
Tìm được: login(), validateCredentials(), authMiddleware()
(dù không chứa từ "authentication")
```

**Tính năng:**
- Tìm code bằng ngôn ngữ tự nhiên
- Hỗ trợ 24+ ngôn ngữ (Python, TypeScript, Go, Rust, Java...)
- 100% chạy local, không gửi code lên cloud
- Memory layer để lưu context dự án

**Cài đặt siêu đơn giản:**

Thêm vào Claude Desktop config:
```json
{
  "mcpServers": {
    "codebaxing": {
      "command": "npx",
      "args": ["-y", "codebaxing"]
    }
  }
}
```

Restart Claude Desktop. Done!

---

npm: https://www.npmjs.com/package/codebaxing
GitHub: https://github.com/duysolo/codebaxing

MIT License - Free & Open Source

#coding #developer #opensource #ai #claude #mcp

---

## Short version (cho Twitter/X)

Vừa release Codebaxing - semantic code search cho Claude Desktop.

Tìm code bằng ngôn ngữ tự nhiên thay vì grep exact text. 100% local, 24+ languages.

```json
{"mcpServers":{"codebaxing":{"command":"npx","args":["-y","codebaxing"]}}}
```

npm: npmjs.com/package/codebaxing

#opensource #ai #developer
