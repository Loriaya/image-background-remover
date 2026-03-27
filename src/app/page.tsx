'use client';

import { useState, useRef } from 'react';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setStatus({ message: '文件太大，最大 10MB', type: 'error' });
      return;
    }
    setSelectedFile(file);
    setResultUrl(null);
    
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setStatus(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleRemoveBg = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setStatus({ message: '处理中...', type: 'info' });
    setResultUrl(null);

    const form = new FormData();
    form.append('image', selectedFile);

    try {
      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        body: form,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || '处理失败');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setStatus({ message: '处理成功！', type: 'success' });
      
      // Auto download
      const a = document.createElement('a');
      a.href = url;
      a.download = `removed-bg-${selectedFile.name}`;
      a.click();
    } catch (error) {
      setStatus({ message: (error as Error).message, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          🖼️ 背景移除工具
        </h1>

        {/* Upload Area */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer transition-all duration-300 hover:border-indigo-500 hover:bg-indigo-50"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {preview ? (
            <img src={preview} alt="预览" className="max-h-64 mx-auto rounded-lg" />
          ) : (
            <>
              <p className="text-gray-600">点击或拖拽图片到这里</p>
              <p className="text-sm text-gray-400 mt-2">支持 JPG/PNG，最大 10MB</p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />

        {/* Submit Button */}
        <button
          onClick={handleRemoveBg}
          disabled={!selectedFile || isProcessing}
          className="w-full mt-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isProcessing ? '处理中...' : '移除背景'}
        </button>

        {/* Status */}
        {status && (
          <p className={`text-center mt-4 ${
            status.type === 'error' ? 'text-red-500' : 
            status.type === 'success' ? 'text-green-500' : 'text-gray-500'
          }`}>
            {status.message}
          </p>
        )}

        {/* Download Link */}
        {resultUrl && (
          <a
            href={resultUrl}
            download={`removed-bg-${selectedFile?.name}`}
            className="block text-center mt-4 text-indigo-500 hover:underline"
          >
            下载结果图片
          </a>
        )}
      </div>
    </div>
  );
}
