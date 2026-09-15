import { NextResponse } from 'next/server';

/**
 * ============================================================
 * 1. ฟังก์ชันป้องกันอักขระพิเศษ
 * ============================================================
 */
const escapeXml = (value: string) => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/**
 * ============================================================
 * 2. วิเคราะห์บริบทของภาพจากชื่อแอป
 * ============================================================
 */
const inferVisualContext = (
  appNameTH: string,
  appNameEN: string
) => {
  const text = `${appNameTH} ${appNameEN}`.trim().toLowerCase();

  if (text.match(/มอเตอร์ไซค์|รถจักร|motorcycle|scooter/)) {
    return 'premium motorcycle dealership and professional motorcycle service center environment';
  }
  if (text.match(/รถยนต์|รถเก๋ง|รถมือสอง|เต็นท์รถ|car|automotive|vehicle/)) {
    return 'premium modern automotive dealership environment';
  }
  if (text.match(/สัตว์|สวนสัตว์|zoo|animal/)) {
    // ปรับให้ระบุชัดเจนว่ามีเสือแค่ 1 ตัว เดินเข้าหากล้อง สรีระสมบูรณ์แบบ
    return 'beautiful realistic wildlife sanctuary with ONLY ONE magnificent adult tiger walking towards the camera in a lush tropical forest, perfect animal anatomy, natural animal habitat';
  }
  if (text.match(/กีฬา|ฟิตเนส|ฟุตบอล|วิ่ง|sport|fitness|football|gym/)) {
    return 'premium athletic sports and lifestyle environment';
  }
  if (text.match(/โรงพยาบาล|คลินิก|สุขภาพ|การแพทย์|หมอ|health|hospital|clinic/)) {
    return 'modern premium hospital and healthcare environment';
  }
  if (text.match(/โรงเรียน|มหาวิทยาลัย|วิทยาลัย|การศึกษา|school|university|education/)) {
    return 'modern premium educational campus environment';
  }
  if (text.match(/ธนาคาร|การเงิน|สินเชื่อ|ลงทุน|ประกัน|bank|finance|investment/)) {
    return 'premium modern financial service environment';
  }
  if (text.match(/ร้านอาหาร|ภัตตาคาร|restaurant|food|dining/)) {
    return 'premium modern restaurant environment';
  }
  if (text.match(/คาเฟ่|ร้านกาแฟ|เบเกอรี่|cafe|coffee|bakery/)) {
    return 'premium modern cafe environment';
  }
  if (text.match(/ร้านค้า|ช้อป|ค้าปลีก|shopping|shop|store|retail/)) {
    return 'premium modern retail environment';
  }
  if (text.match(/ห้องสมุด|หนังสือ|library|book/)) {
    return 'premium modern public library environment';
  }
  if (text.match(/ท่องเที่ยว|ทัวร์|โรงแรม|รีสอร์ท|tour|hotel|travel/)) {
    return 'premium Thai tourism destination environment';
  }
  if (text.match(/ตำรวจ|police/)) {
    return 'modern professional police service environment';
  }
  if (text.match(/ราชการ|รัฐบาล|เทศบาล|กรม|กอง|สำนักงาน|government|civic/)) {
    return 'premium modern civic public service environment';
  }
  if (text.match(/เกษตร|ฟาร์ม|ไร่|สวน|agriculture|farm/)) {
    return 'premium modern agricultural innovation environment';
  }
  if (text.match(/ขนส่ง|เดินทาง|รถไฟ|สนามบิน|transport|transit|airport/)) {
    return 'premium modern transportation hub environment';
  }
  if (text.match(/เทคโนโลยี|ไอที|ซอฟต์แวร์|technology|tech|software|digital/)) {
    return 'premium modern technology business environment';
  }

  return 'premium modern business and service environment';
};

/**
 * ============================================================
 * 3. Prompt สำหรับ AI
 * ============================================================
 */
const buildImagePrompt = (visualContext: string) => {
  return `
Create ONE clean premium vertical environmental photograph.

SCENE:
${visualContext}

The image must look like a real professional commercial photograph.
Show ONLY ONE main subject and environment naturally with PERFECT ANATOMY and REALISTIC PROPORTIONS.

IMPORTANT:
This is ONLY the visual artwork.
ABSOLUTE NO TEXT OF ANY KIND.
Do not generate: application names, signs, logos, letters, numbers, typography.
The final image must contain ZERO readable or pseudo-readable text.

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
 * 4. Negative Prompt (ข้อห้ามของ AI)
 * ============================================================
 */
const buildNegativePrompt = () => {
  // เพิ่มข้อห้ามเรื่องสรีระเพี้ยน (mutated, deformed, extra limbs...)
  return `text, writing, letters, words, numbers, typography, label, title, sign, logo, brand, watermark, smartphone, device, screen, UI, mutated, deformed, extra limbs, bad anatomy, weird proportions, two heads, multiple bodies, disfigured, surreal, unnatural body, overlapping bodies`;
};

/**
 * ============================================================
 * 5. ติดต่อ deAPI เพื่อสร้างรูปพื้นหลัง
 * ============================================================
 */
const generateWithDeApi = async (appNameTH: string, appNameEN: string) => {
  const apiKey = process.env.DEAPI_API_KEY;
  const model = process.env.DEAPI_IMAGE_MODEL || 'Flux_2_Klein_4B_BF16';

  if (!apiKey) throw new Error('DEAPI_API_KEY_MISSING');

  const visualContext = inferVisualContext(appNameTH, appNameEN);
  const prompt = buildImagePrompt(visualContext);
  const negativePrompt = buildNegativePrompt();

  const response = await fetch('https://api.deapi.ai/api/v2/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt,
      negative_prompt: negativePrompt,
      width: 768,
      height: 1344,
      steps: 4,
      seed: -1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`deAPI image generation failed: ${errorText}`);
  }

  const data = await response.json();
  const requestId = data?.data?.request_id || data?.request_id;

  if (!requestId) throw new Error('deAPI ไม่ได้ส่ง request_id กลับมา');

  const maxAttempts = 60;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const jobResponse = await fetch(`https://api.deapi.ai/api/v2/jobs/${requestId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!jobResponse.ok) continue;

    const jobData = await jobResponse.json();
    const job = jobData?.data || jobData;

    if (!job) continue;

    if (job.status === 'done') {
      const resultUrl = job.result_url || job.result || job.results_alt_formats?.png || job.results_alt_formats?.jpg;
      if (!resultUrl) throw new Error('สร้างภาพเสร็จแล้วแต่ไม่พบ URL รูปภาพ');

      const imageResponse = await fetch(resultUrl, { cache: 'no-store' });
      if (!imageResponse.ok) throw new Error('ดาวน์โหลดภาพจาก deAPI ไม่สำเร็จ');

      const contentType = imageResponse.headers.get('content-type') || 'image/png';
      const arrayBuffer = await imageResponse.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      return `data:${contentType};base64,${base64}`;
    }

    if (job.status === 'error' || job.status === 'failed') {
      throw new Error(job.error || job.message || 'AI สร้างภาพไม่สำเร็จ');
    }
  }

  throw new Error('AI ใช้เวลาสร้างภาพนานเกินกำหนด กรุณาลองใหม่อีกครั้ง');
};

/**
 * ============================================================
 * 6. ประกอบภาพ (ส่งแค่ฉากหลัง ไม่ใส่ข้อความซ้อน)
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
      <rect x="3" y="3" width="762" height="1338" rx="38" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="6" />
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

/**
 * ============================================================
 * 7. Fallback (ส่งแค่ฉากหลัง ไม่ใส่ข้อความซ้อน)
 * ============================================================
 */
const buildFallbackArtwork = () => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="768" height="1344" viewBox="0 0 768 1344">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#dff1ff" />
          <stop offset="100%" stop-color="#8fc8ff" />
        </linearGradient>
        <linearGradient id="bottom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
          <stop offset="100%" stop-color="#0c47a1" stop-opacity="0.35" />
        </linearGradient>
      </defs>

      <rect width="768" height="1344" fill="url(#bg)" />
      <circle cx="620" cy="220" r="240" fill="#ffffff" opacity="0.28" />
      <circle cx="120" cy="960" r="280" fill="#ffffff" opacity="0.22" />
      <circle cx="680" cy="880" r="160" fill="#b7dcff" opacity="0.4" />
      <rect x="0" y="900" width="768" height="444" fill="url(#bottom)" />
      <rect x="3" y="3" width="762" height="1338" rx="38" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="6" />
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
    const appNameTH = typeof body.appNameTH === 'string' ? body.appNameTH.trim() : '';
    const appNameEN = typeof body.appNameEN === 'string' ? body.appNameEN.trim() : '';

    if (!appNameTH && !appNameEN) {
      return NextResponse.json(
        { error: 'กรุณาใส่ชื่อแอปก่อนสร้างภาพ' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    try {
      const aiBackgroundImage = await generateWithDeApi(appNameTH, appNameEN);

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
    }

    const fallback = buildFallbackArtwork();
    return NextResponse.json(
      { result: fallback, source: 'local-svg-fallback' },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate', Pragma: 'no-cache' } }
    );

  } catch (error: any) {
    console.error('Generate route error:', error);
    return NextResponse.json(
      { error: `AI Error: ${error?.message || 'ไม่ทราบสาเหตุ'}` },
      { status: 500, headers: { 'Cache-Control': 'no-store', Pragma: 'no-cache' } }
    );
  }
}