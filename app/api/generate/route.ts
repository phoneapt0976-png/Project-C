const buildSvgArtwork = (
  title: string,
  subtitle: string
) => {
  const safeTitle =
    title || 'Mini App';

  const safeSubtitle =
    subtitle || 'Digital Service';

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
            stop-opacity="0.92"
          />
          <stop
            offset="100%"
            stop-color="#ecf4ff"
            stop-opacity="0.85"
          />
        </linearGradient>
      </defs>

      <rect
        width="1200"
        height="1200"
        fill="url(#bg)"
      />

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

      <rect
        x="120"
        y="120"
        width="960"
        height="960"
        rx="60"
        fill="url(#card)"
      />

      <rect
        x="180"
        y="180"
        width="250"
        height="250"
        rx="42"
        fill="#0c47a1"
        opacity="0.1"
      />

      <g transform="translate(210,220)">
        <rect
          width="200"
          height="200"
          rx="42"
          fill="#0c47a1"
        />

        <path
          d="M52 168 L140 52 L160 52 L160 150 L132 150 L132 86 L101 128 L88 128 L69 105 L69 150 L52 150 Z"
          fill="#ffffff"
        />

        <circle
          cx="146"
          cy="88"
          r="17"
          fill="#63b3ff"
        />
      </g>

      <g transform="translate(520,220)">
        <text
          x="0"
          y="110"
          font-family="Arial, Helvetica, sans-serif"
          font-size="72"
          font-weight="700"
          fill="#0c47a1"
        >
          ${safeTitle}
        </text>

        <text
          x="0"
          y="185"
          font-family="Arial, Helvetica, sans-serif"
          font-size="34"
          font-weight="600"
          fill="#3d5f8a"
          letter-spacing="2"
        >
          ${safeSubtitle}
        </text>
      </g>

      <g transform="translate(180,510)">
        <rect
          x="0"
          y="0"
          width="840"
          height="430"
          rx="42"
          fill="#ffffff"
          opacity="0.9"
        />

        <rect
          x="52"
          y="52"
          width="220"
          height="220"
          rx="24"
          fill="#edf5ff"
        />

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

        <g transform="translate(95,105)">
          <rect
            x="0"
            y="0"
            width="120"
            height="120"
            rx="22"
            fill="#0c47a1"
          />

          <path
            d="M30 90 L82 32 L96 32 L96 72 L74 72 L74 54 L55 74 L45 74 L34 63 L34 90 Z"
            fill="#ffffff"
          />
        </g>

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

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    svg
  )}`;
};


/* =========================================================
   FLUX / DEAPI CONFIG
   ========================================================= */

const DEAPI_MODEL =
  process.env.DEAPI_IMAGE_MODEL ||
  'Flux_2_Klein_4B_BF16';

const DEAPI_URL =
  'https://api.deapi.ai/api/v2/images/generations';


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
Create a premium, high-quality visual illustration
for a Thai MiniApp called "${name}" / "${englishName}".

Understand the meaning of the application name
and create an image that directly represents
the actual service, business, place, or subject.

The image must be visually specific to the application.

For example, if the application is a coffee shop
such as "บ้านกาแฟ Coffee House",
create a beautiful realistic coffee house scene:
freshly brewed coffee, elegant coffee cup,
coffee beans, warm modern cafe interior,
natural lighting, premium commercial photography,
inviting atmosphere and realistic details.

If the application represents another service,
business, organization, location, product,
or public service, create an appropriate visual
scene based on that meaning instead.

IMPORTANT:

- prioritize the actual meaning of the application
- strong recognizable main subject
- premium commercial visual quality
- realistic photography or polished cinematic 3D
- natural lighting
- realistic materials and textures
- attractive depth
- clean professional composition
- visually rich but not cluttered
- modern premium aesthetic
- suitable for a mobile MiniApp
- suitable for a professional presentation
- leave some clean negative space for text overlay
- no phone frame
- no UI screenshot
- no app interface
- no buttons
- no website
- no watermark
- no random text
- no random letters
- no fake logos
- no distorted logos
- no unnecessary typography
- do not place large words inside the image
- do not create a poster
- do not create a banner
- focus entirely on the visual subject

Application name:
${name}

English application name:
${englishName}
  `.trim();
};


/* =========================================================
   GENERATE IMAGE WITH FLUX VIA DEAPI
   ========================================================= */

const generateWithDeApi = async (
  appNameTH: string,
  appNameEN: string
) => {
  const apiKey =
    process.env.DEAPI_API_KEY;

  if (!apiKey) {
    console.warn(
      'DEAPI_API_KEY is not configured.'
    );

    return null;
  }

  const prompt =
    buildPrompt(
      appNameTH,
      appNameEN
    );

  const requestBody = {
    model: DEAPI_MODEL,

    prompt,

    width: 1024,

    height: 1024,

    steps: 4,

    seed: -1,
  };

  console.log(
    'FLUX model:',
    DEAPI_MODEL
  );

  const response =
    await fetch(
      DEAPI_URL,
      {
        method: 'POST',

        headers: {
          Accept:
            'application/json',

          'Content-Type':
            'application/json',

          Authorization:
            `Bearer ${apiKey}`,
        },

        body:
          JSON.stringify(
            requestBody
          ),
      }
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `FLUX image generation failed: ${errorText}`
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

  /*
   * deAPI ใช้ระบบ Job Queue
   * จึงต้อง Polling เพื่อรอภาพ
   */

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
      status === 'done' &&
      job?.result_url
    ) {
      return job.result_url;
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

    try {
      const image =
        await generateWithDeApi(
          appNameTH,
          appNameEN
        );

      if (image) {
        return Response.json({
          result: image,

          source: 'flux',

          model:
            DEAPI_MODEL,
        });
      }
    } catch (
      deApiError
    ) {
      console.error(
        'FLUX generate failed, fallback to local SVG:',
        deApiError
      );
    }

    /*
     * ถ้า FLUX / deAPI ล้มเหลว
     * ให้ใช้ SVG สำรอง
     */

    const generated =
      buildSvgArtwork(
        appNameTH,
        appNameEN
      );

    return Response.json({
      result: generated,

      source:
        'local-svg-fallback',

      model:
        DEAPI_MODEL,
    });
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