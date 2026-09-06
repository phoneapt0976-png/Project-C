type GenerateRequest = {
  appNameTH?: string;
  appNameEN?: string;
  orgLogo?: string;
};

function buildPrompt(
  appNameTH: string,
  appNameEN: string
) {
  return `
Create a high-quality square standalone visual illustration based on the subject described below.

SUBJECT:
Thai: ${appNameTH || "Public Service"}
English: ${appNameEN || "Public Service"}

The Thai and English names are ONLY semantic references.
Use them only to understand what real-world subject should be illustrated.

IMPORTANT:
DO NOT reproduce, display, spell, write, draw, render, or visualize the subject name itself.

The final image must communicate the subject ONLY through:
- real-world objects
- people
- animals
- nature
- buildings
- physical environments
- physical activities
- realistic contextual elements

The image should look like a professional standalone illustration that can be placed behind text on a website.

SUBJECT INTERPRETATION:
If the subject is related to:
- animals: show appropriate animals, habitats, nature, trees, water, and surroundings
- transportation: show vehicles, roads, people, and transportation environments
- healthcare: show doctors, patients, medical environments, and physical medical objects
- tourism: show landmarks, nature, travelers, and destinations
- education: show teachers, students, classrooms, books, and learning environments
- public services: show citizens, public buildings, government environments, service activities, and community environments
- retail or shops: show the physical shop environment, products, shelves, customers, and relevant merchandise
- fishing or fishing equipment: show fishing rods, reels, fishing tackle, lures, lines, hooks, tackle boxes, fishing equipment, water, anglers, boats, rivers, lakes, or other natural fishing environments

The interpretation must match the actual subject.

VISUAL STYLE:
- Premium professional illustration
- Modern polished vector / 3D illustration
- High quality
- Detailed
- Friendly
- Trustworthy
- Clean
- Professional
- Approachable
- Modern
- Harmonious colors
- Attractive visual storytelling
- Strong visual hierarchy
- Clear main subject
- Beautiful natural environment
- Professional commercial illustration
- Suitable for a modern Thai service application

COMPOSITION:
- Square 1:1 composition
- Full scene
- Strong central subject
- Clear focal point
- Natural composition
- Balanced composition
- Important objects remain inside the central safe area
- Leave some visually calm areas around the main subject
- Background should support the main subject
- Depth and visual layers
- Professional lighting
- Pleasant color balance
- The image should work well as a full-screen background

VERY IMPORTANT:
Create ONLY the artwork / illustration.

The result must NOT look like:
- an application
- a website
- a mobile app
- a user interface
- a digital interface
- a poster
- an advertisement
- a presentation slide
- a product mockup
- a device screen
- a phone screen

DO NOT create any UI elements.

DO NOT create any text.

DO NOT create any letters.

DO NOT create any numbers.

DO NOT create any words.

DO NOT create any logo.

DO NOT create any brand identity.

DO NOT create any symbols intended as text or branding.

DO NOT create signs containing writing.

DO NOT create labels.

DO NOT create captions.

DO NOT create typography.

DO NOT create watermarks.

DO NOT create frames.

DO NOT create borders.

DO NOT create panels.

DO NOT create cards.

DO NOT create buttons.

DO NOT create menus.

DO NOT create navigation.

DO NOT create QR codes.

DO NOT create barcodes.

DO NOT create screens.

DO NOT create computers.

DO NOT create smartphones.

DO NOT create tablets.

DO NOT create electronic devices.

The final result must be ONLY a clean standalone real-world visual scene.

No written information.
No digital interface.
No graphical interface.
No text.
No typography.
No logo.
No UI.
No device mockup.
`;
}

function buildNegativePrompt() {
  return `
text,
texts,
letter,
letters,
word,
words,
number,
numbers,
typography,
font,
caption,
captions,
label,
labels,
title,
subtitle,
heading,
writing,
written content,
paragraph,
sentence,
sign,
signage,
street sign,
poster,
advertisement,
advertising,
banner,
billboard,
watermark,
watermark text,
logo,
logos,
brand,
brand mark,
branding,
symbol,
symbols,
icon,
icons,
app icon,
interface icon,

smartphone,
mobile phone,
cellphone,
phone,
telephone,
tablet,
ipad,
computer,
laptop,
desktop,
monitor,
smartwatch,
electronic device,
electronic equipment,
electronics,
screen,
display,
digital screen,
phone screen,
mobile screen,

software,
application,
mobile application,
app,
website,
webpage,
web interface,
user interface,
UI,
UX,
dashboard,
digital interface,
app interface,
application interface,
software interface,
mockup,
app mockup,
mobile app mockup,
phone mockup,
device mockup,
device frame,
phone frame,
screen frame,

buttons,
button,
navigation bar,
navigation menu,
menu,
sidebar,
dashboard,
notification,
status bar,
home screen,
lock screen,

QR code,
barcode,

frame,
frames,
border,
borders,
panel,
panels,
card,
cards,
layout,
grid,
template,
infographic,
diagram,

signature,
seal,
stamp,
emblem,

digital art interface,
futuristic interface,
hologram,
virtual screen,
augmented reality,
virtual reality
`;
}

function dataUrlToBase64(dataUrl: string) {
  const match = dataUrl.match(
    /^data:(.+?);base64,(.+)$/
  );

  if (!match) {
    throw new Error(
      "รูปโลโก้ต้องเป็น Base64 data URL"
    );
  }

  return {
    mimeType: match[1],
    data: match[2],
  };
}

async function generateWithDeAPI(
  appNameTH: string,
  appNameEN: string
) {
  const apiKey =
    process.env.DEAPI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ไม่พบ DEAPI_API_KEY ใน .env.local"
    );
  }

  const prompt = buildPrompt(
    appNameTH,
    appNameEN
  );

  const negativePrompt =
    buildNegativePrompt();

  console.log(
    "กำลังส่งคำขอไปยัง DeAPI..."
  );

  // =========================================================
  // 1. SUBMIT GENERATION JOB
  // =========================================================

  const generateResponse = await fetch(
    "https://api.deapi.ai/api/v2/images/generations",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "Flux1schnell",
        prompt,
        negative_prompt: negativePrompt,
        width: 1024,
        height: 1024,
        steps: 4,
        guidance: 3.5,
        seed: -1,
      }),
      cache: "no-store",
    }
  );

  const generateText =
    await generateResponse.text();

  let generateData: any;

  try {
    generateData =
      JSON.parse(generateText);
  } catch {
    throw new Error(
      `DeAPI ส่งข้อมูลกลับมาไม่ถูกต้อง: ${generateText.substring(
        0,
        500
      )}`
    );
  }

  if (!generateResponse.ok) {
    console.error(
      "DeAPI generation error:",
      generateData
    );

    const errorMessage =
      generateData?.error?.message ||
      generateData?.message ||
      generateData?.detail ||
      `DeAPI error ${generateResponse.status}`;

    throw new Error(errorMessage);
  }

  const requestId =
    generateData?.data?.request_id ||
    generateData?.request_id;

  if (!requestId) {
    console.error(
      "DeAPI response:",
      generateData
    );

    throw new Error(
      "DeAPI ไม่ได้ส่ง request_id กลับมา"
    );
  }

  console.log(
    "DeAPI request_id:",
    requestId
  );

  // =========================================================
  // 2. POLL JOB
  // =========================================================

  const maxAttempts = 30;
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

    console.log(
      `กำลังรอ DeAPI... ${
        attempt + 1
      }/${maxAttempts}`
    );

    const statusResponse =
      await fetch(
        `https://api.deapi.ai/api/v2/jobs/${requestId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

    const statusText =
      await statusResponse.text();

    let statusData: any;

    try {
      statusData =
        JSON.parse(statusText);
    } catch {
      continue;
    }

    if (!statusResponse.ok) {
      console.error(
        "DeAPI status error:",
        statusData
      );

      throw new Error(
        statusData?.error?.message ||
          statusData?.message ||
          `ไม่สามารถตรวจสอบสถานะ DeAPI ได้ (${statusResponse.status})`
      );
    }

    const data =
      statusData?.data || statusData;

    const status =
      data?.status;

    console.log(
      "DeAPI status:",
      status
    );

    // =======================================================
    // SUCCESS
    // =======================================================

    if (
      status === "done" ||
      status === "completed" ||
      data?.result_url
    ) {
      const resultUrl =
        data?.result_url ||
        data?.result;

      if (
        !resultUrl ||
        typeof resultUrl !== "string"
      ) {
        throw new Error(
          "DeAPI สร้างรูปเสร็จแล้ว แต่ไม่พบ URL ของรูป"
        );
      }

      console.log(
        "DeAPI สร้างภาพสำเร็จ:",
        resultUrl
      );

      // =====================================================
      // 3. DOWNLOAD IMAGE ON SERVER
      // =====================================================

      const imageResponse =
        await fetch(resultUrl, {
          method: "GET",
          cache: "no-store",
        });

      if (!imageResponse.ok) {
        throw new Error(
          `ไม่สามารถดาวน์โหลดรูปจาก DeAPI ได้ (${imageResponse.status})`
        );
      }

      const imageBuffer =
        await imageResponse.arrayBuffer();

      const contentType =
        imageResponse.headers.get(
          "content-type"
        ) || "image/png";

      const base64 =
        Buffer.from(
          imageBuffer
        ).toString("base64");

      return `data:${contentType};base64,${base64}`;
    }

    // =======================================================
    // ERROR
    // =======================================================

    if (
      status === "error" ||
      status === "failed" ||
      status === "cancelled"
    ) {
      console.error(
        "DeAPI job failed:",
        data
      );

      throw new Error(
        data?.error?.message ||
          data?.error ||
          data?.message ||
          "DeAPI สร้างภาพไม่สำเร็จ"
      );
    }
  }

  throw new Error(
    "DeAPI ใช้เวลาสร้างภาพนานเกินไป กรุณาลองใหม่อีกครั้ง"
  );
}

export async function POST(
  request: Request
) {
  try {
    const body =
      (await request.json()) as GenerateRequest;

    const appNameTH =
      typeof body.appNameTH === "string"
        ? body.appNameTH.trim()
        : "";

    const appNameEN =
      typeof body.appNameEN === "string"
        ? body.appNameEN.trim()
        : "";

    const orgLogo =
      typeof body.orgLogo === "string"
        ? body.orgLogo
        : "";

    // =========================================================
    // VALIDATE
    // =========================================================

    if (
      !appNameTH &&
      !appNameEN
    ) {
      return Response.json(
        {
          error:
            "กรุณากรอกชื่อแอปภาษาไทยหรือภาษาอังกฤษ",
        },
        {
          status: 400,
        }
      );
    }

    if (!orgLogo) {
      return Response.json(
        {
          error:
            "กรุณาอัปโหลดโลโก้หน่วยงาน",
        },
        {
          status: 400,
        }
      );
    }

    // ตรวจสอบว่า orgLogo เป็น Base64 image
    if (
      orgLogo.startsWith("data:image/")
    ) {
      try {
        dataUrlToBase64(orgLogo);
      } catch {
        return Response.json(
          {
            error:
              "รูปโลโก้ไม่ถูกต้อง",
          },
          {
            status: 400,
          }
        );
      }
    }

    // =========================================================
    // GENERATE
    // =========================================================

    const result =
      await generateWithDeAPI(
        appNameTH,
        appNameEN
      );

    // =========================================================
    // RETURN
    // =========================================================

    return Response.json({
      result,
      source: "deapi",
    });
  } catch (error: unknown) {
    console.error(
      "DeAPI image generation error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "เกิดข้อผิดพลาดในการสร้างภาพ AI";

    return Response.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}