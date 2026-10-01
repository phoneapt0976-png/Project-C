import { NextResponse } from 'next/server';

// The image provider is asynchronous and can take several polling cycles.
export const maxDuration = 60;

/**
 * ============================================================
 * Prompt สำหรับ AI
 * ============================================================
 */
const buildImagePrompt = (
  userPrompt: string
) => {
  return `
Create ONE new clean premium vertical environmental photograph based on the user's image prompt below.

USER IMAGE PROMPT:
${userPrompt}

The image must look like a real professional commercial photograph.
Show ONLY ONE main subject and environment naturally with PERFECT ANATOMY and REALISTIC PROPORTIONS.

IMPORTANT:
Create only the background artwork, with a clean unmarked scene and no lettering, signs, logos, or watermark.

COMPOSITION:
Vertical 9:16.
Single main subject should occupy the middle and lower area.
Keep the upper area visually clean and natural.

STYLE:
Photorealistic. Premium commercial photography. Cinematic natural lighting. Highly detailed. Perfect anatomical correctness.
`;
};

/**
 * ============================================================
 * ติดต่อ deAPI เพื่อสร้างรูปพื้นหลัง (พร้อมระบบกันค้าง)
 * ============================================================
 */
const generateWithDeApi = async (
  userPrompt: string
) => {
  const deadline = Date.now() + 50_000;
  const apiKey = process.env.DEAPI_API_KEY;
  const model = process.env.DEAPI_IMAGE_MODEL || 'Flux_2_Klein_4B_BF16';

  if (!apiKey) throw new Error('DEAPI_API_KEY_MISSING');

  const prompt = buildImagePrompt(userPrompt);
  const formData = new FormData();
  formData.append('model', model);
  formData.append('prompt', prompt);
  formData.append('width', '768');
  formData.append('height', '1344');
  formData.append('steps', '4');
  formData.append('seed', '-1');

  // Reserve time for job polling and downloading the completed image.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let response;
  try {
    response = await fetch('https://api.deapi.ai/api/v2/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch {
    clearTimeout(timeoutId);
    throw new Error('ไม่สามารถส่งคำขอไปยัง AI ได้ภายใน 15 วินาที');
  }

  if (!response.ok) {
    const errorText = (await response.text()).slice(0, 500);
    throw new Error(`deAPI image generation failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const requestId = data?.data?.request_id || data?.request_id;

  if (!requestId) throw new Error('deAPI ไม่ได้ส่ง request_id กลับมา');

  const maxAttempts = 20;
  for (let attempt = 0; attempt < maxAttempts && Date.now() < deadline; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const remainingTime = deadline - Date.now();
    if (remainingTime <= 0) break;

    const jobController = new AbortController();
    const jobTimeoutId = setTimeout(
      () => jobController.abort(),
      Math.min(5000, remainingTime)
    );
    let jobResponse;
    try {
      jobResponse = await fetch(`https://api.deapi.ai/api/v2/jobs/${requestId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
        cache: 'no-store',
        signal: jobController.signal,
      });
    } finally {
      clearTimeout(jobTimeoutId);
    }

    if (!jobResponse.ok) {
      const errorText = await jobResponse.text();
      throw new Error(`ตรวจสอบสถานะภาพจาก deAPI ไม่สำเร็จ (${jobResponse.status}): ${errorText}`);
    }

    const jobData = await jobResponse.json();
    const job = jobData?.data || jobData;

    if (!job) continue;

    const status = typeof job.status === 'string' ? job.status.toLowerCase() : '';

    if (['done', 'completed', 'complete', 'success', 'succeeded'].includes(status)) {
      const resultUrl = job.result_url || job.result || job.results_alt_formats?.png || job.results_alt_formats?.jpg || job.results_alt_formats?.webp;
      if (!resultUrl) throw new Error('สร้างภาพเสร็จแล้วแต่ไม่พบ URL รูปภาพ');

      // ✨ กันค้าง 2: ควบคุมเวลาดาวน์โหลดรูป 20 วินาที
      const imgController = new AbortController();
      const imgTimeoutId = setTimeout(
        () => imgController.abort(),
        Math.max(1, Math.min(8000, deadline - Date.now()))
      );

      try {
        const imageResponse = await fetch(resultUrl, { 
          cache: 'no-store',
          signal: imgController.signal
        });
        clearTimeout(imgTimeoutId);

        if (!imageResponse.ok) throw new Error('ดาวน์โหลดภาพจาก deAPI ไม่สำเร็จ');

        const contentType = imageResponse.headers.get('content-type') || 'image/png';
        const arrayBuffer = await imageResponse.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        return `data:${contentType};base64,${base64}`;
      } catch {
        clearTimeout(imgTimeoutId);
        throw new Error('ไม่สามารถดาวน์โหลดภาพผลลัพธ์ได้ (Timeout)');
      }
    }

    if (['error', 'failed', 'failure', 'cancelled', 'canceled'].includes(status)) {
      throw new Error(
        job.error ||
          job.message ||
          job.error_reason ||
          job.error_code ||
          'AI สร้างภาพไม่สำเร็จ'
      );
    }
  }

  throw new Error('AI ใช้เวลาสร้างภาพนานเกินกำหนด กรุณาลองใหม่อีกครั้ง');
};

/**
 * ============================================================
 * ประกอบภาพ (ส่งแค่ฉากหลัง ไม่ใส่ข้อความซ้อน และลบกรอบขาว)
 * ============================================================
 */
const buildFinalArtwork = (aiImage: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="768" height="1344" viewBox="0 0 768 1344">
      <defs>
        <linearGradient id="topGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.50" />
          <stop offset="45%" stop-color="#000000" stop-opacity="0.16" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="bottomGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#000000" stop-opacity="0" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.40" />
        </linearGradient>
      </defs>

      <image href="${aiImage}" x="0" y="0" width="768" height="1344" preserveAspectRatio="xMidYMid slice" />
      <rect x="0" y="0" width="768" height="360" fill="url(#topGradient)" />
      <rect x="0" y="950" width="768" height="394" fill="url(#bottomGradient)" />
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

/**
 * ============================================================
 * MAIN POST ROUTE
 * ============================================================
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userPrompt = typeof body.imagePrompt === 'string' ? body.imagePrompt.trim() : '';

    if (!userPrompt) {
      return NextResponse.json(
        { error: 'กรุณาใส่ Prompt สำหรับสร้างภาพพื้นหลังก่อน' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (userPrompt.length > 1000) {
      return NextResponse.json(
        { error: 'Prompt ต้องมีความยาวไม่เกิน 1,000 ตัวอักษร' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    try {
      const aiBackgroundImage = await generateWithDeApi(userPrompt);

      if (aiBackgroundImage) {
        const finalArtwork = buildFinalArtwork(aiBackgroundImage);
        return NextResponse.json(
          { result: finalArtwork, source: 'deapi-text-to-image' },
          { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate', Pragma: 'no-cache' } }
        );
      }
    } catch (deApiError) {
      console.error('deAPI generate failed, fallback to local artwork:', deApiError);

      if (deApiError instanceof Error && deApiError.message === 'DEAPI_API_KEY_MISSING') {
        return NextResponse.json(
          { error: 'ยังไม่ได้ใส่ DEAPI_API_KEY ในไฟล์ .env.local' },
          { status: 500 }
        );
      }

      const errorMessage = deApiError instanceof Error
        ? deApiError.message.slice(0, 500)
        : 'ไม่ทราบสาเหตุ';

      return NextResponse.json(
        { error: `AI สร้างภาพไม่สำเร็จ: ${errorMessage}` },
        {
          status: 502,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            Pragma: 'no-cache',
          },
        }
      );
    }

    return NextResponse.json(
      { error: 'AI สร้างภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' },
      { status: 502, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate', Pragma: 'no-cache' } }
    );

  } catch (error: unknown) {
    console.error('Generate route error:', error);
    const errorMessage = error instanceof Error ? error.message : 'ไม่ทราบสาเหตุ';
    return NextResponse.json(
      { error: `AI Error: ${errorMessage}` },
      { status: 500, headers: { 'Cache-Control': 'no-store', Pragma: 'no-cache' } }
    );
  }
}
