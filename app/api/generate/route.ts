/* =========================================================
   SVG FALLBACK
   ========================================================= */

const escapeXml = (value: string) => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

const buildSvgArtwork = (
  title: string,
  subtitle: string,
  orgLogo?: string
) => {
  const safeTitle =
    escapeXml(title || 'Mini App');

  const safeSubtitle =
    escapeXml(subtitle || 'Digital Service');

  const logo =
    orgLogo || '';

  const logoImage = logo
    ? `
      <image
        href="${logo}"
        x="205"
        y="205"
        width="210"
        height="210"
        preserveAspectRatio="xMidYMid meet"
      />
    `
    : `
      <rect
        x="210"
        y="210"
        width="200"
        height="200"
        rx="42"
        fill="#0c47a1"
      />

      <path
        d="M252 368 L340 252 L360 252 L360 350 L332 350 L332 286 L301 328 L288 328 L269 305 L269 350 L252 350 Z"
        fill="#ffffff"
      />

      <circle
        cx="346"
        cy="288"
        r="17"
        fill="#63b3ff"
      />
    `;

  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1200"
      height="1200"
      viewBox="0 0 1200 1200"
    >

      <defs>

        <linearGradient
          id="bg"
          x1="0"
          x2="1"
          y1="0"
          y2="1"
        >
          <stop
            offset="0%"
            stop-color="#eaf4ff"
          />

          <stop
            offset="100%"
            stop-color="#dfeeff"
          />
        </linearGradient>

        <linearGradient
          id="card"
          x1="0"
          x2="1"
          y1="0"
          y2="1"
        >
          <stop
            offset="0%"
            stop-color="#ffffff"
            stop-opacity="0.96"
          />

          <stop
            offset="100%"
            stop-color="#ecf4ff"
            stop-opacity="0.9"
          />
        </linearGradient>

      </defs>


      <!-- Background -->

      <rect
        width="1200"
        height="1200"
        fill="url(#bg)"
      />


      <!-- Decorative circles -->

      <circle
        cx="980"
        cy="170"
        r="150"
        fill="#cfe3ff"
        opacity="0.75"
      />

      <circle
        cx="250"
        cy="920"
        r="180"
        fill="#cfe3ff"
        opacity="0.65"
      />

      <circle
        cx="1010"
        cy="980"
        r="120"
        fill="#b7d7ff"
        opacity="0.75"
      />


      <!-- Main card -->

      <rect
        x="120"
        y="120"
        width="960"
        height="960"
        rx="60"
        fill="url(#card)"
      />


      <!-- Logo area -->

      <rect
        x="180"
        y="180"
        width="250"
        height="250"
        rx="42"
        fill="#0c47a1"
        opacity="0.08"
      />

      ${logoImage}


      <!-- Application name -->

      <g transform="translate(520,220)">

        <text
          x="0"
          y="110"
          font-family="Arial, Helvetica, sans-serif"
          font-size="64"
          font-weight="700"
          fill="#0c47a1"
        >
          ${safeTitle}
        </text>

        <text
          x="0"
          y="185"
          font-family="Arial, Helvetica, sans-serif"
          font-size="32"
          font-weight="600"
          fill="#3d5f8a"
          letter-spacing="2"
        >
          ${safeSubtitle}
        </text>

      </g>


      <!-- Illustration preview card -->

      <g transform="translate(180,510)">

        <rect
          x="0"
          y="0"
          width="840"
          height="430"
          rx="42"
          fill="#ffffff"
          opacity="0.92"
        />


        <!-- Illustration placeholder -->

        <rect
          x="52"
          y="52"
          width="220"
          height="220"
          rx="24"
          fill="#edf5ff"
        />


        <!-- Content lines -->

        <rect
          x="330"
          y="72"
          width="430"
          height="32"
          rx="16"
          fill="#dfeeff"
        />

        <rect
          x="330"
          y="140"
          width="350"
          height="28"
          rx="14"
          fill="#eaf3ff"
        />

        <rect
          x="330"
          y="190"
          width="420"
          height="28"
          rx="14"
          fill="#eaf3ff"
        />


        <!-- Small logo -->

        ${
          logo
            ? `
              <image
                href="${logo}"
                x="92"
                y="92"
                width="140"
                height="140"
                preserveAspectRatio="xMidYMid meet"
              />
            `
            : `
              <rect
                x="95"
                y="105"
                width="120"
                height="120"
                rx="22"
                fill="#0c47a1"
              />

              <path
                d="M125 195 L177 137 L191 137 L191 177 L169 177 L169 159 L150 179 L140 179 L129 168 L129 195 Z"
                fill="#ffffff"
              />
            `
        }


        <!-- Button -->

        <g transform="translate(540,280)">

          <rect
            x="0"
            y="0"
            width="166"
            height="58"
            rx="29"
            fill="#0c47a1"
          />

          <text
            x="83"
            y="38"
            text-anchor="middle"
            font-family="Arial, Helvetica, sans-serif"
            font-size="26"
            font-weight="700"
            fill="#ffffff"
          >
            บริการ
          </text>

        </g>

      </g>

    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};


/* =========================================================
   FLUX / DEAPI CONFIG
   ========================================================= */

const DEAPI_MODEL =
  process.env.DEAPI_IMAGE_MODEL ||
  'Flux_2_Klein_4B_BF16';

const DEAPI_EDIT_URL =
  'https://api.deapi.ai/api/v2/images/edits';


/* =========================================================
   PROMPT
   ========================================================= */

const buildPrompt = (
  appNameTH: string,
  appNameEN: string
) => {
  const name =
    appNameTH ||
    appNameEN ||
    'Mini App';

  const englishName =
    appNameEN ||
    name;

  return `
Transform the provided organization logo into a
premium minimal sticker-style illustration.

The uploaded image is the ORIGINAL ORGANIZATION LOGO.
Use it as the main visual reference.

Application name:
"${name}"

English application name:
"${englishName}"

IMPORTANT:

- preserve the recognizable identity of the original logo
- keep the main symbol and visual concept recognizable
- use the uploaded logo as the primary subject
- transform the logo into a clean modern sticker illustration
- minimal but visually attractive
- professional corporate style
- suitable for a Thai government or professional MiniApp
- clean vector-like appearance
- smooth shapes
- subtle dimensional depth
- soft highlights
- clean edges
- polished commercial illustration
- balanced composition
- centered main subject
- simple background
- light and clean color palette
- premium presentation quality
- suitable for mobile application artwork
- suitable for a professional presentation

The application name should influence the visual
concept when appropriate.

If the organization name describes a place,
service, product, educational subject, hospital,
government organization, shop, or other specific
subject, subtly incorporate that concept into the
illustration while keeping the original logo
recognizable.

For example:

- hospital -> subtle medical visual elements
- school -> subtle education elements
- coffee shop -> subtle coffee elements
- government office -> subtle public-service elements
- museum -> subtle cultural elements
- financial service -> subtle finance elements

Do NOT replace the original logo with an unrelated
image.

Do NOT invent a completely different logo.

Do NOT create a poster.

Do NOT create a banner.

Do NOT create a website.

Do NOT create a mobile UI.

Do NOT create buttons.

Do NOT create a phone frame.

Do NOT add large text.

Do NOT add random letters.

Do NOT add random typography.

Do NOT add watermark.

Do NOT distort the original logo unnecessarily.

The final image should look like a
professional minimal sticker / mascot illustration
derived from the uploaded organization logo.
  `.trim();
};


/* =========================================================
   DATA URL -> BLOB
   ========================================================= */

const dataUrlToBlob = (
  dataUrl: string
): Blob => {
  const match =
    dataUrl.match(
      /^data:([^;,]+)?(?:;base64)?,(.*)$/
    );

  if (!match) {
    throw new Error(
      'รูปโลโก้มีรูปแบบไม่ถูกต้อง'
    );
  }

  const mimeType =
    match[1] ||
    'image/png';

  const data =
    match[2];

  if (
    dataUrl.includes(';base64')
  ) {
    const binary =
      Buffer.from(
        data,
        'base64'
      );

    return new Blob(
      [binary],
      {
        type: mimeType,
      }
    );
  }

  return new Blob(
    [
      decodeURIComponent(
        data
      ),
    ],
    {
      type: mimeType,
    }
  );
};


/* =========================================================
   POLL DEAPI JOB
   ========================================================= */

const waitForDeApiResult = async (
  requestId: string,
  apiKey: string
) => {

  const maxAttempts = 60;

  const pollInterval = 2000;

  for (
    let attempt = 0;
    attempt < maxAttempts;
    attempt++
  ) {

    await new Promise<void>(
      (resolve) =>
        setTimeout(
          resolve,
          pollInterval
        )
    );


    const jobResponse =
      await fetch(
        `https://api.deapi.ai/api/v2/jobs/${requestId}`,
        {
          method: 'GET',

          headers: {
            Accept:
              'application/json',

            Authorization:
              `Bearer ${apiKey}`,
          },
        }
      );


    if (!jobResponse.ok) {

      const errorText =
        await jobResponse.text();

      throw new Error(
        `FLUX job status failed: ${errorText}`
      );
    }


    const jobData =
      (await jobResponse.json()) as {
        data?: {
          status?: string;
          result_url?: string;
          result?: string;
          error?: string;
        };
      };


    const job =
      jobData?.data;


    const status =
      job?.status;


    console.log(
      `FLUX generation status: ${status}`
    );


    if (
      status === 'done'
    ) {

      const result =
        job?.result_url ||
        job?.result;

      if (result) {
        return result;
      }

      throw new Error(
        'FLUX สร้างภาพสำเร็จแต่ไม่พบ URL ของภาพ'
      );
    }


    if (
      status === 'error'
    ) {

      throw new Error(
        job?.error ||
          'FLUX สร้างภาพไม่สำเร็จ'
      );
    }

  }


  throw new Error(
    'FLUX ใช้เวลาสร้างภาพนานเกินไป'
  );
};


/* =========================================================
   GENERATE IMAGE FROM LOGO
   ========================================================= */

const generateWithDeApi = async (
  appNameTH: string,
  appNameEN: string,
  orgLogo: string
) => {

  const apiKey =
    process.env.DEAPI_API_KEY;


  if (!apiKey) {

    console.warn(
      'DEAPI_API_KEY is not configured.'
    );

    return null;
  }


  if (!orgLogo) {

    throw new Error(
      'ไม่พบโลโก้สำหรับสร้างภาพ'
    );
  }


  const prompt =
    buildPrompt(
      appNameTH,
      appNameEN
    );


  const imageBlob =
    dataUrlToBlob(
      orgLogo
    );


  /*
   * deAPI Image Edit
   *
   * ใช้ FLUX.2 Klein
   * เพื่อเปลี่ยนโลโก้ที่อัปโหลด
   * ให้เป็น sticker illustration
   */

  const formData =
    new FormData();


  formData.append(
    'image',
    imageBlob,
    'organization-logo.png'
  );


  formData.append(
    'prompt',
    prompt
  );


  formData.append(
    'model',
    DEAPI_MODEL
  );


  formData.append(
    'steps',
    '4'
  );


  formData.append(
    'seed',
    String(
      Math.floor(
        Math.random() *
          2147483647
      )
    )
  );


  console.log(
    'FLUX image edit model:',
    DEAPI_MODEL
  );


  const response =
    await fetch(
      DEAPI_EDIT_URL,
      {
        method: 'POST',

        headers: {
          Accept:
            'application/json',

          Authorization:
            `Bearer ${apiKey}`,
        },

        body:
          formData,
      }
    );


  if (!response.ok) {

    const errorText =
      await response.text();

    throw new Error(
      `FLUX image edit failed: ${errorText}`
    );
  }


  const data =
    (await response.json()) as {
      data?: {
        request_id?: string;
      };
    };


  const requestId =
    data?.data?.request_id;


  if (!requestId) {

    throw new Error(
      'deAPI ไม่ได้ส่ง request_id กลับมา'
    );
  }


  return await waitForDeApiResult(
    requestId,
    apiKey
  );
};


/* =========================================================
   POST
   ========================================================= */

export async function POST(
  request: Request
) {

  try {

    const body =
      (await request.json()) as {
        appNameTH?: string;
        appNameEN?: string;
        orgLogo?: string;
      };


    const appNameTH =
      body.appNameTH?.trim() ||
      '';


    const appNameEN =
      body.appNameEN?.trim() ||
      '';


    const orgLogo =
      body.orgLogo?.trim() ||
      '';


    /*
     * ต้องมีชื่อแอป
     */

    if (
      !appNameTH &&
      !appNameEN
    ) {

      return Response.json(
        {
          error:
            'กรุณาใส่ชื่อแอปก่อน',
        },
        {
          status: 400,
        }
      );
    }


    /*
     * ต้องมีโลโก้
     *
     * เพราะตอนนี้ FLUX จะใช้
     * โลโก้เป็นภาพต้นฉบับ
     */

    if (!orgLogo) {

      return Response.json(
        {
          error:
            'กรุณาอัปโหลดโลโก้องค์กรก่อนสร้างภาพ',
        },
        {
          status: 400,
        }
      );
    }


    try {

      const image =
        await generateWithDeApi(
          appNameTH,
          appNameEN,
          orgLogo
        );


      if (image) {

        return Response.json(
          {
            result: image,

            source:
              'flux-image-edit',

            model:
              DEAPI_MODEL,
          }
        );
      }

    } catch (
      deApiError
    ) {

      console.error(
        'FLUX image edit failed, fallback to local SVG:',
        deApiError
      );

    }


    /*
     * ถ้า FLUX ล้มเหลว
     * ใช้ SVG fallback
     * และเอาโลโก้จริงมาแสดงด้วย
     */

    const generated =
      buildSvgArtwork(
        appNameTH,
        appNameEN,
        orgLogo
      );


    return Response.json(
      {
        result:
          generated,

        source:
          'local-svg-fallback',

        model:
          DEAPI_MODEL,
      }
    );


  } catch (
    error
  ) {

    console.error(
      'Generate route error:',
      error
    );


    return Response.json(
      {
        error:
          'AI สร้างรูปไม่สำเร็จ',
      },
      {
        status: 500,
      }
    );

  }
}