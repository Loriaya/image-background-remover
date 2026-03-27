export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (request.method === "GET" && url.pathname === "/") {
      return new Response(HTML, {
        headers: { "Content-Type": "text/html" }
      });
    }
    
    if (request.method === "POST" && url.pathname === "/remove-bg") {
      try {
        const formData = await request.formData();
        const image = formData.get("image");
        
        if (!image) {
          return new Response(JSON.stringify({ error: "No image provided" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        
        const imageBuffer = await image.arrayBuffer();
        const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
        
        const form = new FormData();
        form.append("image_file", image, image.name);
        form.append("image_file_b64", base64Image);
        
        const response = await fetch("https://api.remove.bg/v1.0/removebg", {
          method: "POST",
          headers: {
            "X-Api-Key": env.REMOVE_BG_API_KEY
          },
          body: form
        });
        
        if (!response.ok) {
          const error = await response.text();
          return new Response(JSON.stringify({ error: error }), {
            status: response.status,
            headers: { "Content-Type": "application/json" }
          });
        }
        
        const result = await response.arrayBuffer();
        return new Response(result, {
          headers: {
            "Content-Type": "image/png",
            "Content-Disposition": `attachment; filename="removed-bg-${image.name}"`
          }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    
    return new Response("Not Found", { status: 404 });
  }
};

const HTML = `
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>背景移除工具</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
           min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
           display: flex; justify-content: center; align-items: center; padding: 20px; }
    .container { background: white; border-radius: 16px; padding: 40px; max-width: 500px; width: 100%;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    h1 { text-align: center; color: #333; margin-bottom: 30px; }
    .upload-area { border: 2px dashed #ccc; border-radius: 12px; padding: 40px; text-align: center;
                   cursor: pointer; transition: all 0.3s; margin-bottom: 20px; }
    .upload-area:hover { border-color: #667eea; background: #f8f9ff; }
    .upload-area.dragover { border-color: #667eea; background: #f0f3ff; }
    .preview { max-width: 100%; max-height: 300px; border-radius: 8px; display: none; margin: 0 auto 20px; }
    .btn { width: 100%; padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
           color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;
           transition: transform 0.2s; }
    .btn:hover { transform: translateY(-2px); }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .status { text-align: center; margin-top: 20px; color: #666; }
    .error { color: #e74c3c; }
    .success { color: #27ae60; }
    input[type="file"] { display: none; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🖼️ 背景移除工具</h1>
    <div class="upload-area" id="uploadArea">
      <p>点击或拖拽图片到这里</p>
      <p style="font-size: 12px; color: #999; margin-top: 8px;">支持 JPG/PNG，最大 10MB</p>
    </div>
    <input type="file" id="fileInput" accept="image/*">
    <img class="preview" id="preview" alt="预览">
    <button class="btn" id="submitBtn" disabled>移除背景</button>
    <div class="status" id="status"></div>
  </div>
  <script>
    const uploadArea = document.getElementById("uploadArea");
    const fileInput = document.getElementById("fileInput");
    const preview = document.getElementById("preview");
    const submitBtn = document.getElementById("submitBtn");
    const status = document.getElementById("status");
    let currentFile = null;
    
    uploadArea.addEventListener("click", () => fileInput.click());
    uploadArea.addEventListener("dragover", (e) => { e.preventDefault(); uploadArea.classList.add("dragover"); });
    uploadArea.addEventListener("dragleave", () => uploadArea.classList.remove("dragover"));
    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadArea.classList.remove("dragover");
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener("change", () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });
    
    function handleFile(file) {
      if (file.size > 10 * 1024 * 1024) {
        status.textContent = "文件太大，最大 10MB";
        status.className = "status error";
        return;
      }
      currentFile = file;
      const reader = new FileReader();
      reader.onload = (e) => { preview.src = e.target.result; preview.style.display = "block"; };
      reader.readAsDataURL(file);
      submitBtn.disabled = false;
      status.textContent = "";
    }
    
    submitBtn.addEventListener("click", async () => {
      if (!currentFile) return;
      submitBtn.disabled = true;
      status.textContent = "处理中...";
      status.className = "status";
      
      const form = new FormData();
      form.append("image", currentFile);
      
      try {
        const response = await fetch("/remove-bg", { method: "POST", body: form });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "处理失败");
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "removed-bg-" + currentFile.name;
        a.click();
        URL.revokeObjectURL(url);
        status.textContent = "处理成功！";
        status.className = "status success";
      } catch (e) {
        status.textContent = e.message;
        status.className = "status error";
      } finally {
        submitBtn.disabled = false;
      }
    });
  </script>
</body>
</html>
`;
