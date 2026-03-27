import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;

    if (!image) {
      return NextResponse.json(
        { error: '请选择图片文件' },
        { status: 400 }
      );
    }

    // Convert to base64
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');

    // Call remove.bg API
    const form = new FormData();
    form.append('image_file', new Blob([arrayBuffer]), image.name);
    form.append('image_file_b64', base64Image);

    const apiKey = process.env.REMOVE_BG_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: '服务器未配置 API Key' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: form,
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: error || 'API 调用失败' },
        { status: response.status }
      );
    }

    const result = await response.arrayBuffer();

    return new NextResponse(result, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="removed-bg-${image.name}"`,
      },
    });
  } catch (error) {
    console.error('Error removing background:', error);
    return NextResponse.json(
      { error: (error as Error).message || '处理失败' },
      { status: 500 }
    );
  }
}
