import { NextResponse } from 'next/server';

// The image provider is asynchronous and can take several polling cycles.
export const maxDuration = 60;

/**
 * ============================================================
 * วิเคราะห์บริบทของภาพจากชื่อแอป
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
  // ✨ คีย์เวิร์ดสัตว์เจาะจง
  if (text.match(/สัตว์|สวนสัตว์|zoo|animal|เสือ|tiger|แมว|cat|หมา|สุนัข|dog|นก|bird|ปลา|fish/)) {
    const animalName = appNameEN || 'magnificent animal';
    return `beautiful realistic wildlife sanctuary with ONLY ONE ${animalName} walking towards the camera in a lush tropical forest, perfect animal anatomy, natural animal habitat`;
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
  if (text.match(/ศูนย์(?:คุณ)?ธรรม|คุ(?:ณ)?ธรรม|จริยธรรม|คุณค่า|ethic|morality|moral|integrity/)) {
    return 'a real welcoming Thai moral development and ethics center, with people of different ages learning and practicing compassion, honesty, responsibility, and helping one another through natural community activities; warm human-centered documentary photography';
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

  // Use the app name as a fallback cue when it does not match a known category.
  const fallbackSubject = appNameEN || appNameTH || 'modern business';
  return `premium realistic environment representing the concept of "${fallbackSubject}"`;
};

/**
 * ============================================================
 * Prompt สำหรับ AI
 * ============================================================
 */
const buildImagePrompt = (
  visualContext: string,
  appNameTH: string,
  appNameEN: string
) => {
  return `
Create ONE new clean premium vertical environmental photograph using BOTH the app name and the supplied organization logo as references.

SCENE:
${visualContext}

APP NAME:
${appNameTH || appNameEN}

LOGO REFERENCE:
Study the supplied logo for its subject, symbols, colors, and visual identity. Use those clues together with the app name to choose a relevant scene and color palette. Treat the logo only as a visual reference; create a new photographic scene instead of copying or placing the logo into the image.
If the name describes an abstract mission or value, represent it through a believable place and human activity rather than a literal symbol. When the name and logo are ambiguous, prefer a coherent scene that fits their shared clues.

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
  appNameTH: string,
  appNameEN: string,
  orgLogo: string
) => {
  const deadline = Date.now() + 50_000;
  const apiKey = process.env.DEAPI_API_KEY;
  const model = process.env.DEAPI_IMAGE_MODEL || 'Flux_2_Klein_4B_BF16';

  if (!apiKey) throw new Error('DEAPI_API_KEY_MISSING');

  const visualContext = inferVisualContext(appNameTH, appNameEN);
  const prompt = buildImagePrompt(visualContext, appNameTH, appNameEN);
  const logoMatch = orgLogo.match(/^data:(image\/[\w.+-]+);base64,([\s\S]+)$/);

  if (!logoMatch) {
    throw new Error('โลโก้ต้องเป็นไฟล์รูปภาพชนิด Base64');
  }

  const logoBytes = Uint8Array.from(Buffer.from(logoMatch[2], 'base64'));
  const logoBlob = new Blob([logoBytes], { type: logoMatch[1] });
  const formData = new FormData();
  formData.append('model', model);
  formData.append('prompt', prompt);
  formData.append('image', logoBlob, 'organization-logo.png');
  formData.append('width', '768');
  formData.append('height', '1344');
  formData.append('steps', '4');
  formData.append('seed', '-1');

  // Reserve time for job polling and downloading the completed image.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let response;
  try {
    response = await fetch('https://api.deapi.ai/api/v2/images/edits', {
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
 * Fallback artwork used when the image provider is temporarily unavailable.
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
    const orgLogo = typeof body.orgLogo === 'string' ? body.orgLogo : '';

    if (!appNameTH && !appNameEN) {
      return NextResponse.json(
        { error: 'กรุณาใส่ชื่อแอปก่อนสร้างภาพ' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (!orgLogo) {
      return NextResponse.json(
        { error: 'กรุณาอัปโหลดโลโก้หน่วยงานก่อนสร้างภาพ' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    try {
      const aiBackgroundImage = await generateWithDeApi(appNameTH, appNameEN, orgLogo);

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

  } catch (error: unknown) {
    console.error('Generate route error:', error);
    const errorMessage = error instanceof Error ? error.message : 'ไม่ทราบสาเหตุ';
    return NextResponse.json(
      { error: `AI Error: ${errorMessage}` },
      { status: 500, headers: { 'Cache-Control': 'no-store', Pragma: 'no-cache' } }
    );
  }
}
