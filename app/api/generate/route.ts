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
    return 'A REAL MAGNIFICENT ADULT TIGER IS THE ONLY MAIN SUBJECT. ONE SINGLE TIGER ONLY. The tiger is walking naturally toward the camera in a lush tropical wildlife sanctuary and natural forest habitat. The tiger must have realistic perfect anatomy, four legs, one head, one body, natural fur, realistic proportions, and a completely natural animal posture. NO HUMANS. NO PEOPLE. NO PERSON. The scene is an authentic wildlife photograph focused entirely on the single tiger.';
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
  const isAnimalScene =
    visualContext.includes('ONE SINGLE TIGER ONLY') ||
    visualContext.includes('NO HUMANS');

  if (isAnimalScene) {
    return `
Create ONE premium photorealistic wildlife photograph.

SCENE:
${visualContext}

THIS IS AN ANIMAL-ONLY SCENE.

The ONLY subject in the entire image must be ONE SINGLE REAL ADULT TIGER.

STRICT SUBJECT RULES:
- ONE tiger only.
- Exactly one animal.
- No second animal.
- No humans.
- No people.
- No person.
- No human face.
- No human body.
- No human silhouette.
- No human figure.
- No zookeeper.
- No visitors.
- No crowd.
- No people in the background.
- No people reflected in surfaces.
- No human-like figure.

The tiger must be the clear main subject.
Show the tiger walking naturally toward the camera.
The tiger must be fully visible and anatomically correct.

TIGER ANATOMY:
- one head
- one body
- four legs
- two front legs
- two rear legs
- two ears
- one tail
- realistic paws
- realistic claws
- realistic tiger face
- realistic eyes
- realistic fur
- realistic body proportions
- natural walking posture

The tiger must look like a real living Bengal tiger photographed in the wild.

ENVIRONMENT:
Lush tropical forest.
Natural green vegetation.
Natural trees and plants.
Natural ground.
Natural wildlife sanctuary environment.
Authentic animal habitat.
Natural depth and perspective.

Do NOT create a zoo visitor area.
Do NOT create a zoo enclosure.
Do NOT create a cage.
Do NOT create a building.
Do NOT create a human environment.

COMPOSITION:
Vertical 9:16.
Premium mobile application background.
The tiger should occupy the middle and lower area.
Leave some clean natural scenery around the tiger.
The upper area should contain only natural forest scenery.

STYLE:
Ultra photorealistic.
Professional wildlife photography.
Premium commercial photography.
Cinematic natural lighting.
Highly detailed realistic fur.
Realistic anatomy.
Realistic proportions.
Natural shadows.
Natural depth of field.
Natural color grading.
Authentic real-world photography.

ABSOLUTELY NO TEXT:
No words.
No letters.
No numbers.
No symbols.
No signs.
No labels.
No logos.
No typography.
No watermark.
No writing-like objects.

MOST IMPORTANT:
ONE TIGER ONLY.
NO HUMANS.
NO PEOPLE.
NO SECOND ANIMAL.
NO DEFORMED ANATOMY.
NO EXTRA LIMBS.
NO DUPLICATED BODY PARTS.

Generate ONLY the natural wildlife photograph.
`;
  }

  return `
Create ONE clean premium vertical environmental photograph.

SCENE:
${visualContext}

The image must look like a real professional commercial photograph.
Show the subject and environment naturally.

IMPORTANT:
This is ONLY the visual artwork.

ABSOLUTELY NO TEXT OF ANY KIND.

Do not generate:
- application names
- organization names
- company names
- brand names
- titles
- subtitles
- captions
- labels
- signs
- logos
- letters
- numbers
- typography
- text-like objects
- text-like patterns

The final image must contain ZERO readable or pseudo-readable text.

Use only real objects, natural surfaces, animals, people, buildings,
plants, furniture, equipment, and environmental details.

Do not add any graphic design elements.

Do not add anything that would normally contain writing.

Avoid objects such as:
signs,
boards,
banners,
posters,
billboards,
menus,
screens,
displays,
name plates,
labels,
documents,
papers,
tickets,
advertisements,
branded products,
branded vehicles,
branded clothing.

Keep the entire environment visually clean and natural.

COMPOSITION:
Vertical 9:16.
Premium mobile application background.
Main subject should occupy the middle and lower area.
Keep the upper area visually clean and natural.
No artificial graphic elements.
No poster-like composition.

STYLE:
Photorealistic.
Premium commercial photography.
Cinematic natural lighting.
Highly detailed.
Realistic textures.
Realistic proportions.
Natural shadows.
Natural depth of field.
Professional photography.
Natural color grading.
Elegant and sophisticated.
Authentic real-world environment.

MOST IMPORTANT:
Generate a PURE PHOTOGRAPHIC SCENE.

ZERO TEXT.
ZERO LETTERS.
ZERO WORDS.
ZERO NUMBERS.
ZERO LOGOS.
ZERO SIGNS.
ZERO LABELS.
ZERO TYPOGRAPHY.
ZERO TEXT-LIKE SHAPES.

Only generate the environmental artwork.
`;
};

/**
 * ============================================================
 * 4. Negative Prompt
 * ============================================================
 */
const buildNegativePrompt = (visualContext: string) => {
  const baseNegativePrompt = `
text,
writing,
letters,
words,
numbers,
digits,
typography,
caption,
label,
title,
subtitle,
alphabet,
characters,
glyphs,
symbols,
fake text,
pseudo text,
gibberish,
random letters,
random words,
misspelled words,
text-like shapes,
letter-like shapes,
writing-like patterns,
watermark,
logo,
logos,
brand,
branding,
brand name,
company name,
organization name,
application name,
app name,
app title,
sign,
signage,
street sign,
road sign,
shop sign,
building sign,
name plate,
poster,
billboard,
banner,
advertisement,
menu,
ticket,
information board,
notice board,
direction board,
display board,
price tag,
name tag,
label tag,
document,
paper,
certificate,
newspaper,
magazine,
book cover,
printed material,
packaging text,
product label,
vehicle branding,
clothing logo,
wall writing,
graffiti,
neon sign,
digital display,
screen,
smartphone,
mobile phone,
tablet,
laptop,
computer,
monitor,
device,
UI,
user interface,
application interface,
website,
dashboard,
button,
menu,
card,
mockup,
frame,
graphic design,
overlay,
caption overlay,
poster design,
advertising graphic
`;

  const isAnimalScene =
    visualContext.includes('ONE SINGLE TIGER ONLY') ||
    visualContext.includes('NO HUMANS');

  if (isAnimalScene) {
    return `
${baseNegativePrompt},

human,
humans,
person,
people,
man,
woman,
boy,
girl,
child,
children,
human face,
human body,
human figure,
human silhouette,
human head,
human hands,
human arms,
human legs,
zookeeper,
visitor,
tourist,
crowd,
group of people,
multiple people,
second animal,
multiple animals,
two tigers,
two tiger,
another tiger,
duplicate tiger,
animal duplication,
extra head,
extra body,
extra legs,
extra arms,
extra paws,
extra tail,
extra ears,
deformed tiger,
mutated tiger,
distorted tiger,
bad tiger anatomy,
broken anatomy,
unnatural anatomy,
malformed animal,
disfigured animal,
overlapping animal,
merged animal,
duplicate body parts,
surreal animal
`;
  }

  return baseNegativePrompt;
};

/**
 * ============================================================
 * 5. ติดต่อ deAPI เพื่อสร้างรูปพื้นหลัง
 * ============================================================
 */
const generateWithDeApi = async (
  appNameTH: string,
  appNameEN: string
) => {
  const apiKey = process.env.DEAPI_API_KEY;

  const model =
    process.env.DEAPI_IMAGE_MODEL ||
    'Flux_2_Klein_4B_BF16';

  if (!apiKey) {
    throw new Error('DEAPI_API_KEY_MISSING');
  }

  const visualContext =
    inferVisualContext(
      appNameTH,
      appNameEN
    );

  const prompt =
    buildImagePrompt(
      visualContext
    );

  const negativePrompt =
    buildNegativePrompt(
      visualContext
    );

  console.log(
    'Context sent to AI:',
    visualContext
  );

  console.log(
    'Generating clean text-free environmental artwork'
  );

  const response =
    await fetch(
      'https://api.deapi.ai/api/v2/images/generations',
      {
        method: 'POST',

        headers: {
          Authorization:
            `Bearer ${apiKey}`,

          Accept:
            'application/json',

          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          model,

          prompt,

          negative_prompt:
            negativePrompt,

          width: 768,

          height: 1344,

          steps: 4,

          seed: -1,
        }),
      }
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `deAPI image generation failed: ${errorText}`
    );
  }

  const data =
    await response.json();

  const requestId =
    data?.data?.request_id ||
    data?.request_id;

  if (!requestId) {
    throw new Error(
      'deAPI ไม่ได้ส่ง request_id กลับมา'
    );
  }

  /**
   * ----------------------------------------------------------
   * Poll job
   * ----------------------------------------------------------
   */
  const maxAttempts = 60;

  for (
    let attempt = 0;
    attempt < maxAttempts;
    attempt++
  ) {
    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          5000
        )
    );

    const jobResponse =
      await fetch(
        `https://api.deapi.ai/api/v2/jobs/${requestId}`,
        {
          method: 'GET',

          headers: {
            Authorization:
              `Bearer ${apiKey}`,

            Accept:
              'application/json',
          },

          cache:
            'no-store',
        }
      );

    if (!jobResponse.ok) {
      continue;
    }

    const jobData =
      await jobResponse.json();

    const job =
      jobData?.data ||
      jobData;

    if (!job) {
      continue;
    }

    console.log(
      `deAPI job ${requestId}: ${job.status} (${job.progress ?? 0}%)`
    );

    /**
     * --------------------------------------------------------
     * DONE
     * --------------------------------------------------------
     */
    if (
      job.status ===
      'done'
    ) {
      const resultUrl =
        job.result_url ||
        job.result ||
        job.results_alt_formats?.png ||
        job.results_alt_formats?.jpg;

      if (!resultUrl) {
        throw new Error(
          'สร้างภาพเสร็จแล้วแต่ไม่พบ URL รูปภาพ'
        );
      }

      const imageResponse =
        await fetch(
          resultUrl,
          {
            cache:
              'no-store',
          }
        );

      if (
        !imageResponse.ok
      ) {
        throw new Error(
          'ดาวน์โหลดภาพจาก deAPI ไม่สำเร็จ'
        );
      }

      const contentType =
        imageResponse.headers.get(
          'content-type'
        ) ||
        'image/png';

      const arrayBuffer =
        await imageResponse.arrayBuffer();

      const base64 =
        Buffer
          .from(arrayBuffer)
          .toString(
            'base64'
          );

      return `data:${contentType};base64,${base64}`;
    }

    /**
     * --------------------------------------------------------
     * ERROR
     * --------------------------------------------------------
     */
    if (
      job.status ===
        'error' ||
      job.status ===
        'failed'
    ) {
      throw new Error(
        job.error ||
          job.message ||
          'AI สร้างภาพไม่สำเร็จ'
      );
    }
  }

  throw new Error(
    'AI ใช้เวลาสร้างภาพนานเกินกำหนด กรุณาลองใหม่อีกครั้ง'
  );
};

/**
 * ============================================================
 * 6. ประกอบภาพ
 * ============================================================
 */
const buildFinalArtwork = (
  aiImage: string
) => {
  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="768"
      height="1344"
      viewBox="0 0 768 1344"
    >

      <defs>

        <linearGradient
          id="topGradient"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >

          <stop
            offset="0%"
            stop-color="#000000"
            stop-opacity="0.50"
          />

          <stop
            offset="45%"
            stop-color="#000000"
            stop-opacity="0.16"
          />

          <stop
            offset="100%"
            stop-color="#000000"
            stop-opacity="0"
          />

        </linearGradient>

        <linearGradient
          id="bottomGradient"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >

          <stop
            offset="0%"
            stop-color="#000000"
            stop-opacity="0"
          />

          <stop
            offset="100%"
            stop-color="#000000"
            stop-opacity="0.40"
          />

        </linearGradient>

      </defs>

      <image
        href="${aiImage}"
        x="0"
        y="0"
        width="768"
        height="1344"
        preserveAspectRatio="xMidYMid slice"
      />

      <rect
        x="0"
        y="0"
        width="768"
        height="360"
        fill="url(#topGradient)"
      />

      <rect
        x="0"
        y="950"
        width="768"
        height="394"
        fill="url(#bottomGradient)"
      />

      <rect
        x="3"
        y="3"
        width="762"
        height="1338"
        rx="38"
        fill="none"
        stroke="#ffffff"
        stroke-opacity="0.35"
        stroke-width="6"
      />

    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

/**
 * ============================================================
 * 7. Fallback
 * ============================================================
 */
const buildFallbackArtwork = () => {
  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="768"
      height="1344"
      viewBox="0 0 768 1344"
    >

      <defs>

        <linearGradient
          id="bg"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >

          <stop
            offset="0%"
            stop-color="#dff1ff"
          />

          <stop
            offset="100%"
            stop-color="#8fc8ff"
          />

        </linearGradient>

        <linearGradient
          id="bottom"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >

          <stop
            offset="0%"
            stop-color="#ffffff"
            stop-opacity="0"
          />

          <stop
            offset="100%"
            stop-color="#0c47a1"
            stop-opacity="0.35"
          />

        </linearGradient>

      </defs>

      <rect
        width="768"
        height="1344"
        fill="url(#bg)"
      />

      <circle
        cx="620"
        cy="220"
        r="240"
        fill="#ffffff"
        opacity="0.28"
      />

      <circle
        cx="120"
        cy="960"
        r="280"
        fill="#ffffff"
        opacity="0.22"
      />

      <circle
        cx="680"
        cy="880"
        r="160"
        fill="#b7dcff"
        opacity="0.4"
      />

      <rect
        x="0"
        y="900"
        width="768"
        height="444"
        fill="url(#bottom)"
      />

      <rect
        x="3"
        y="3"
        width="762"
        height="1338"
        rx="38"
        fill="none"
        stroke="#ffffff"
        stroke-opacity="0.5"
        stroke-width="6"
      />

    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

/**
 * ============================================================
 * MAIN POST ROUTE
 * ============================================================
 */
export async function POST(
  request: Request
) {
  try {

    const body =
      await request.json();

    const appNameTH =
      typeof body.appNameTH === 'string'
        ? body.appNameTH.trim()
        : '';

    const appNameEN =
      typeof body.appNameEN === 'string'
        ? body.appNameEN.trim()
        : '';

    if (
      !appNameTH &&
      !appNameEN
    ) {
      return NextResponse.json(
        {
          error:
            'กรุณาใส่ชื่อแอปก่อนสร้างภาพ',
        },
        {
          status: 400,

          headers: {
            'Cache-Control':
              'no-store',
          },
        }
      );
    }

    try {

      const aiBackgroundImage =
        await generateWithDeApi(
          appNameTH,
          appNameEN
        );

      if (
        aiBackgroundImage
      ) {

        const finalArtwork =
          buildFinalArtwork(
            aiBackgroundImage
          );

        return NextResponse.json(
          {
            result:
              finalArtwork,

            source:
              'deapi-text-to-image',
          },

          {
            headers: {
              'Cache-Control':
                'no-store, no-cache, must-revalidate',

              Pragma:
                'no-cache',
            },
          }
        );
      }

    } catch (
      deApiError
    ) {

      console.error(
        'deAPI generate failed, fallback to local artwork:',
        deApiError
      );

      if (
        deApiError instanceof Error &&
        deApiError.message ===
          'DEAPI_API_KEY_MISSING'
      ) {
        return NextResponse.json(
          {
            error:
              'ยังไม่ได้ใส่ DEAPI_API_KEY ในไฟล์ .env.local',
          },
          {
            status: 500,
          }
        );
      }
    }

    const fallback =
      buildFallbackArtwork();

    return NextResponse.json(
      {
        result:
          fallback,

        source:
          'local-svg-fallback',
      },

      {
        headers: {
          'Cache-Control':
            'no-store, no-cache, must-revalidate',

          Pragma:
            'no-cache',
        },
      }
    );

  } catch (
    error: any
  ) {

    console.error(
      'Generate route error:',
      error
    );

    return NextResponse.json(
      {
        error:
          `AI Error: ${
            error?.message ||
            'ไม่ทราบสาเหตุ'
          }`,
      },

      {
        status: 500,

        headers: {
          'Cache-Control':
            'no-store',

          Pragma:
            'no-cache',
        },
      }
    );
  }
}