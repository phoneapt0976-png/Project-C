import { NextResponse } from 'next/server';

/**
 * ============================================================
 * DEAPI MINI APP ARTWORK GENERATOR
 * ============================================================
 */

const DEAPI_API_URL = 'https://api.deapi.ai';

const DEAPI_IMAGE_EDIT_ENDPOINT =
  `${DEAPI_API_URL}/api/v2/images/edits`;

const DEAPI_JOB_ENDPOINT =
  `${DEAPI_API_URL}/api/v2/jobs`;

const DEAPI_MODEL =
  process.env.DEAPI_IMAGE_MODEL ||
  'Flux_2_Klein_4B_BF16';

/**
 * ============================================================
 * Retry Settings
 * ============================================================
 *
 * Retry เฉพาะ HTTP 429
 *
 * 1st retry  -> 3 sec
 * 2nd retry  -> 7 sec
 * 3rd retry  -> 15 sec
 */

const DEAPI_RETRY_DELAYS = [
  3000,
  7000,
  15000,
];

/**
 * ============================================================
 * Build Image Prompt
 * ============================================================
 */

const buildImagePrompt = (
  appNameTH: string,
  appNameEN: string
) => {
  return `
You are an expert visual concept director,
branding analyst, environment designer,
commercial photographer, and AI image prompt specialist.

You are given information about a mobile application.

============================================================
APPLICATION INFORMATION
============================================================

THAI APPLICATION NAME:
${appNameTH || '(not provided)'}

ENGLISH APPLICATION NAME:
${appNameEN || '(not provided)'}

You are ALSO given an organization logo as a visual reference image.

============================================================
YOUR TASK
============================================================

First, intelligently understand the meaning of the application.

Use BOTH:

1. The application name
2. The organization logo

to infer the most likely:

- organization identity
- organization type
- industry
- service domain
- public-service domain
- business domain
- real-world activity
- environment
- architecture
- objects
- surroundings
- atmosphere
- visual tone

Then create ONE environmental artwork that visually represents
what this application actually does or what service it provides.

The generated image should communicate the purpose of the application
WITHOUT using any text.

IMPORTANT:

Do NOT simply create a generic attractive background.

The environment must have a meaningful relationship
with the application.

The scene should make sense if a person sees the image
without seeing the application name.

============================================================
CONTEXT REASONING
============================================================

Do NOT use fixed keyword mapping.

Do NOT follow rules such as:

"hospital = hospital building"

"restaurant = restaurant"

"school = classroom"

"government = government office"

Instead, understand the complete context.

The same word can represent different types of applications.

Consider the relationship between:

- organization
- service
- users
- real-world location
- real-world activity
- surrounding environment

Choose the scene that is most semantically appropriate.

The organization logo is an important visual clue,
but it is NOT an object that should appear in the final image.

============================================================
REAL-WORLD REPRESENTATION
============================================================

The artwork should look like a believable real-world environment
associated with the application.

Examples of possible visual elements include:

- buildings
- facilities
- streets
- public spaces
- service counters
- educational environments
- healthcare environments
- transportation environments
- parks
- nature
- infrastructure
- industrial environments
- offices
- commercial environments
- community environments
- people performing relevant activities
- relevant objects

However:

ONLY include elements that genuinely make sense
for the inferred application.

Do NOT randomly add:

- cars
- motorcycles
- roads
- mountains
- parks
- towers
- offices
- garages
- city skylines

unless they are actually relevant.

============================================================
LOGO RESTRICTION
============================================================

The uploaded organization logo is ONLY a visual reference.

The logo is provided so you can understand
the organization's identity and visual character.

DO NOT reproduce the logo.

DO NOT redraw the logo.

DO NOT recreate the logo.

DO NOT modify the logo.

DO NOT turn the logo into an object.

DO NOT turn the logo into:

- a building
- a monument
- a sculpture
- a statue
- a billboard
- a sign
- a wall graphic
- an advertisement
- a giant object
- fake branding

DO NOT place a copy of the logo anywhere in the generated image.

The real logo will be placed separately by the application.

============================================================
NO BRANDING
============================================================

Do NOT create:

- fake company branding
- fake organization branding
- fake logos
- fake signs
- fake advertisements
- branded vehicles
- branded buildings
- branded uniforms
- branded products

Keep the environment visually authentic.

============================================================
TEXT RESTRICTION
============================================================

ABSOLUTELY NO READABLE TEXT.

Do NOT generate:

- Thai text
- English text
- Chinese text
- Japanese text
- letters
- numbers
- words
- captions
- labels
- signs
- road signs
- advertisements
- billboards
- posters
- banners
- menus
- documents
- watermarks
- typography

ZERO readable text.

If a real-world environment normally contains signs,
make them blank, distant, blurred, unreadable,
or positioned outside the visible composition.

============================================================
UI RESTRICTION
============================================================

This is ONLY environmental artwork.

DO NOT generate:

- smartphone
- tablet
- laptop
- computer interface
- website
- application UI
- dashboard
- buttons
- menus
- cards
- navigation bars
- interface elements
- screenshots
- app mockups

============================================================
COMPOSITION
============================================================

Create a premium vertical mobile artwork.

Aspect ratio: 9:16.

The image will be used as a mobile application cover.

Composition requirements:

- strong foreground
- meaningful middle ground
- realistic background
- natural depth
- realistic perspective
- cinematic framing

Keep the:

- upper-left area relatively clean
- upper-center area relatively clean

The top area will later contain:

- the real organization logo
- application name
- application subtitle

Therefore:

DO NOT place the main subject directly behind
the upper-left title area.

The most important environmental subject
should primarily occupy the middle and lower portions
of the image.

Use negative space naturally.

Do NOT create a huge empty white area.

The upper area should still feel like part of the environment,
but remain visually calm enough for overlay text.

============================================================
VISUAL STYLE
============================================================

Premium commercial photography.

Cinematic environmental photography.

Photorealistic.

Highly detailed.

Professional advertising photography.

High-end commercial artwork.

Realistic architecture.

Realistic materials.

Realistic vegetation when appropriate.

Realistic objects.

Realistic people when appropriate.

Natural human proportions.

Natural lighting.

Beautiful daylight.

Soft sunlight.

Realistic shadows.

Subtle atmospheric depth.

Natural color grading.

Sophisticated composition.

Modern elegant appearance.

Trustworthy atmosphere.

Welcoming atmosphere.

Authentic environment.

Avoid excessive fantasy.

Avoid surrealism unless the application context
clearly requires it.

============================================================
PEOPLE
============================================================

People may appear only when appropriate.

People should normally be secondary environmental elements.

They should support the context of the application.

For example:

- people using a relevant facility
- people receiving a service
- people working in the environment
- people performing relevant activities

Do NOT make one random person the main subject.

Avoid:

- exaggerated poses
- unrealistic anatomy
- distorted faces
- duplicated people
- unnatural hands

============================================================
VISUAL PRIORITY
============================================================

Priority order:

1. Correctly represent the application/service.
2. Create a believable real-world environment.
3. Reflect the organization's visual identity subtly.
4. Create premium commercial composition.
5. Preserve clean space for application branding overlay.

The semantic meaning of the scene is MORE IMPORTANT
than making the image simply beautiful.

============================================================
FINAL RESULT
============================================================

Generate ONLY ONE environmental artwork.

The artwork must look like a premium,
high-quality vertical commercial photograph.

It must visually communicate the purpose
of the application and organization.

It must NOT contain:

- text
- letters
- numbers
- logos
- fake branding
- UI
- application interface
- watermark
- typography

The organization logo must NOT appear in the generated image.

The logo is ONLY used as a visual reference
for understanding organizational identity.

Aspect ratio: 9:16.

IMPORTANT FINAL INSTRUCTION:

Do not explain your reasoning.

Do not output text.

Only generate the final environmental image.
`;
};

/**
 * ============================================================
 * Utility
 * ============================================================
 */

const sleep = async (
  ms: number
): Promise<void> => {
  await new Promise<void>((resolve) =>
    setTimeout(resolve, ms)
  );
};

/**
 * ============================================================
 * Convert Data URL → Blob
 * ============================================================
 */

const dataUrlToBlob = async (
  dataUrl: string
): Promise<Blob> => {
  if (!dataUrl.startsWith('data:')) {
    throw new Error(
      'รูปโลโก้ต้องเป็น Data URL'
    );
  }

  const response = await fetch(dataUrl);

  if (!response.ok) {
    throw new Error(
      'ไม่สามารถอ่านไฟล์โลโก้ได้'
    );
  }

  return await response.blob();
};

/**
 * ============================================================
 * Submit deAPI Image Generation Job
 * ============================================================
 */

const submitDeApiJob = async (
  appNameTH: string,
  appNameEN: string,
  orgLogo: string
) => {
  const apiKey =
    process.env.DEAPI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'DEAPI_API_KEY_MISSING'
    );
  }

  const logoBlob =
    await dataUrlToBlob(orgLogo);

  if (
    logoBlob.size >
    10 * 1024 * 1024
  ) {
    throw new Error(
      'โลโก้มีขนาดใหญ่เกิน 10 MB'
    );
  }

  const prompt =
    buildImagePrompt(
      appNameTH,
      appNameEN
    );

  /**
   * ----------------------------------------------------------
   * Retry Loop
   * ----------------------------------------------------------
   *
   * สำคัญ:
   * FormData ใหม่ทุกครั้ง
   * เพราะ request body ไม่ควรถูก reuse หลังจาก fetch
   */

  for (
    let attempt = 0;
    attempt <= DEAPI_RETRY_DELAYS.length;
    attempt++
  ) {
    const formData =
      new FormData();

    formData.append(
      'model',
      DEAPI_MODEL
    );

    formData.append(
      'prompt',
      prompt
    );

    formData.append(
      'width',
      '768'
    );

    formData.append(
      'height',
      '1360'
    );

    formData.append(
      'steps',
      '4'
    );

    formData.append(
      'seed',
      '-1'
    );

    formData.append(
      'image',
      logoBlob,
      'organization-logo.png'
    );

    console.log(
      `deAPI image request attempt ${
        attempt + 1
      }/${DEAPI_RETRY_DELAYS.length + 1}`
    );

    const response =
      await fetch(
        DEAPI_IMAGE_EDIT_ENDPOINT,
        {
          method: 'POST',

          headers: {
            Authorization:
              `Bearer ${apiKey}`,

            Accept:
              'application/json',
          },

          body:
            formData,

          cache:
            'no-store',
        }
      );

    const responseText =
      await response.text();

    let data: any = null;

    try {
      data =
        JSON.parse(
          responseText
        );
    } catch {
      data = null;
    }

    /**
     * --------------------------------------------------------
     * SUCCESS
     * --------------------------------------------------------
     */

    if (response.ok) {
      const requestId =
        data?.data?.request_id ||
        data?.request_id;

      if (!requestId) {
        throw new Error(
          'deAPI ไม่ได้ส่ง request_id กลับมา'
        );
      }

      return requestId;
    }

    /**
     * --------------------------------------------------------
     * RATE LIMIT
     * --------------------------------------------------------
     */

    if (
      response.status === 429
    ) {
      const retryAfterHeader =
        response.headers.get(
          'retry-after'
        );

      let retryAfterMs =
        DEAPI_RETRY_DELAYS[
          attempt
        ];

      if (retryAfterHeader) {
        const retryAfterSeconds =
          Number(
            retryAfterHeader
          );

        if (
          Number.isFinite(
            retryAfterSeconds
          ) &&
          retryAfterSeconds >= 0
        ) {
          retryAfterMs =
            retryAfterSeconds * 1000;
        }
      }

      /**
       * ถ้ายังมี retry เหลือ
       */

      if (
        attempt <
        DEAPI_RETRY_DELAYS.length
      ) {
        console.warn(
          `deAPI rate limited (429). Retrying in ${
            Math.ceil(
              retryAfterMs / 1000
            )
          } seconds...`
        );

        await sleep(
          retryAfterMs
        );

        continue;
      }

      /**
       * Retry ครบแล้ว
       */

      throw new Error(
        'DEAPI_RATE_LIMITED'
      );
    }

    /**
     * --------------------------------------------------------
     * Other API Errors
     * --------------------------------------------------------
     */

    throw new Error(
      `deAPI request failed (${response.status}): ${
        data?.error ||
        data?.message ||
        responseText ||
        'Unknown error'
      }`
    );
  }

  throw new Error(
    'DEAPI_RATE_LIMITED'
  );
};

/**
 * ============================================================
 * Poll deAPI Job
 * ============================================================
 */

const waitForDeApiResult = async (
  requestId: string
): Promise<string> => {
  const apiKey =
    process.env.DEAPI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'DEAPI_API_KEY_MISSING'
    );
  }

  const maxAttempts =
    60;

  const pollInterval =
    2000;

  for (
    let attempt = 0;
    attempt < maxAttempts;
    attempt++
  ) {
    const response =
      await fetch(
        `${DEAPI_JOB_ENDPOINT}/${requestId}`,
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

    const responseText =
      await response.text();

    let data: any = null;

    try {
      data =
        JSON.parse(
          responseText
        );
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        `deAPI job check failed (${response.status}): ${
          data?.error ||
          data?.message ||
          responseText ||
          'Unknown error'
        }`
      );
    }

    const job =
      data?.data ||
      data;

    const status =
      job?.status;

    console.log(
      `deAPI job ${requestId}: ${status} (${job?.progress ?? 0}%)`
    );

    /**
     * SUCCESS
     */

    if (
      status === 'done'
    ) {
      const resultUrl =
        job?.result_url ||
        job?.result ||
        job?.results_alt_formats?.png ||
        job?.results_alt_formats?.jpg;

      if (!resultUrl) {
        throw new Error(
          'deAPI สร้างภาพเสร็จแล้วแต่ไม่พบ result_url'
        );
      }

      return resultUrl;
    }

    /**
     * ERROR
     */

    if (
      status === 'error' ||
      status === 'failed'
    ) {
      throw new Error(
        `deAPI image generation error: ${
          job?.error ||
          job?.message ||
          'Unknown generation error'
        }`
      );
    }

    /**
     * WAIT
     */

    await sleep(
      pollInterval
    );
  }

  throw new Error(
    'deAPI ใช้เวลาสร้างภาพนานเกินกำหนด กรุณาลองใหม่อีกครั้ง'
  );
};

/**
 * ============================================================
 * Download Result → Data URL
 * ============================================================
 */

const downloadAsDataUrl = async (
  imageUrl: string
): Promise<string> => {
  const response =
    await fetch(
      imageUrl
    );

  if (!response.ok) {
    throw new Error(
      'ไม่สามารถดาวน์โหลดภาพจาก deAPI ได้'
    );
  }

  const contentType =
    response.headers.get(
      'content-type'
    ) ||
    'image/png';

  const arrayBuffer =
    await response.arrayBuffer();

  const base64 =
    Buffer
      .from(arrayBuffer)
      .toString('base64');

  return `data:${contentType};base64,${base64}`;
};

/**
 * ============================================================
 * POST
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

    const orgLogo =
      typeof body.orgLogo === 'string'
        ? body.orgLogo.trim()
        : '';

    /**
     * ========================================================
     * VALIDATION
     * ========================================================
     */

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
        }
      );
    }

    if (!orgLogo) {
      return NextResponse.json(
        {
          error:
            'กรุณาอัปโหลดโลโก้องค์กรก่อนสร้างภาพ',
        },
        {
          status: 400,
        }
      );
    }

    /**
     * ========================================================
     * STEP 1
     * ========================================================
     */

    const requestId =
      await submitDeApiJob(
        appNameTH,
        appNameEN,
        orgLogo
      );

    console.log(
      'deAPI request ID:',
      requestId
    );

    /**
     * ========================================================
     * STEP 2
     * ========================================================
     */

    const resultUrl =
      await waitForDeApiResult(
        requestId
      );

    /**
     * ========================================================
     * STEP 3
     * ========================================================
     */

    const imageDataUrl =
      await downloadAsDataUrl(
        resultUrl
      );

    /**
     * ========================================================
     * RETURN
     * ========================================================
     */

    return NextResponse.json(
      {
        result:
          imageDataUrl,

        source:
          'deapi-image-to-image',

        requestId,
      }
    );
  } catch (
    error: any
  ) {
    console.error(
      'deAPI Generate route error:',
      error
    );

    /**
     * ========================================================
     * API KEY ERROR
     * ========================================================
     */

    if (
      error?.message ===
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

    /**
     * ========================================================
     * RATE LIMIT ERROR
     * ========================================================
     */

    if (
      error?.message ===
      'DEAPI_RATE_LIMITED'
    ) {
      return NextResponse.json(
        {
          error:
            'deAPI กำลังจำกัดจำนวนการใช้งานชั่วคราว (429 Too Many Attempts) กรุณารอสักครู่แล้วลองใหม่อีกครั้ง',
        },
        {
          status: 429,
        }
      );
    }

    /**
     * ========================================================
     * GENERAL ERROR
     * ========================================================
     */

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
      }
    );
  }
}