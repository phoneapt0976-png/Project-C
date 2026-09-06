'use client';

import React, { useState, useRef, useEffect } from 'react';
import '@fontsource/anuphan/400.css';
import '@fontsource/anuphan/600.css';
import '@fontsource/anuphan/700.css';
import { toPng } from 'html-to-image';

export default function MiniAppForm() {
  const [showPreview, setShowPreview] = useState(false);

  const [orgLogo, setOrgLogo] = useState<string | null>(null);
  const [appLogo, setAppLogo] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [footerLogo, setFooterLogo] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const [appNameTH, setAppNameTH] = useState('');
  const [appNameEN, setAppNameEN] = useState('');
  const [headerService, setHeaderService] = useState('');
  const [detail1, setDetail1] = useState('');

  const [themeColor, setThemeColor] = useState('#0c47a1');

  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // สีตัวอักษรด้านบนของ Screen 1
  const [titleTextColor, setTitleTextColor] = useState('#ffffff');
  const [titleTextShadow, setTitleTextShadow] = useState(
    '0 2px 8px rgba(0,0,0,0.75)'
  );

  const screen1Ref = useRef<HTMLDivElement>(null);
  const screen2Ref = useRef<HTMLDivElement>(null);
  const screen3Ref = useRef<HTMLDivElement>(null);

  /*
   * ============================================================
   * วิเคราะห์สีภาพ AI
   * ============================================================
   */

  const analyzeImageTextColor = async (
    imageSrc: string
  ): Promise<void> => {
    try {
      const img = new Image();

      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();

        img.onerror = () =>
          reject(new Error('ไม่สามารถวิเคราะห์สีภาพได้'));

        img.src = imageSrc;
      });

      const canvas = document.createElement('canvas');

      const sampleWidth = 360;
      const sampleHeight = 190;

      canvas.width = sampleWidth;
      canvas.height = sampleHeight;

      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return;
      }

      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        Math.min(
          img.height,
          (img.width / sampleWidth) * sampleHeight
        ),
        0,
        0,
        sampleWidth,
        sampleHeight
      );

      const imageData = ctx.getImageData(
        0,
        0,
        sampleWidth,
        sampleHeight
      );

      const data = imageData.data;

      let totalLuminance = 0;
      let totalWeight = 0;

      for (let y = 0; y < sampleHeight; y += 4) {
        for (let x = 0; x < sampleWidth; x += 4) {
          const index = (y * sampleWidth + x) * 4;

          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          const a = data[index + 3];

          if (a < 50) continue;

          const luminance =
            0.2126 * r +
            0.7152 * g +
            0.0722 * b;

          const centerDistance =
            Math.abs(x - sampleWidth / 2) /
            (sampleWidth / 2);

          const weight =
            1 - centerDistance * 0.25;

          totalLuminance +=
            luminance * weight;

          totalWeight += weight;
        }
      }

      if (totalWeight === 0) {
        setTitleTextColor('#ffffff');

        setTitleTextShadow(
          '0 2px 8px rgba(0,0,0,0.75)'
        );

        return;
      }

      const averageLuminance =
        totalLuminance / totalWeight;

      if (averageLuminance < 145) {
        setTitleTextColor('#ffffff');

        setTitleTextShadow(
          '0 2px 8px rgba(0,0,0,0.8)'
        );
      } else {
        setTitleTextColor('#111827');

        setTitleTextShadow(
          '0 2px 8px rgba(255,255,255,0.75)'
        );
      }

      console.log(
        'Average background luminance:',
        averageLuminance
      );

      console.log(
        'Title text color:',
        averageLuminance < 145
          ? 'WHITE'
          : 'BLACK'
      );
    } catch (error) {
      console.warn(
        'วิเคราะห์สีภาพไม่สำเร็จ ใช้สีขาวเป็นค่าเริ่มต้น',
        error
      );

      setTitleTextColor('#ffffff');

      setTitleTextShadow(
        '0 2px 8px rgba(0,0,0,0.75)'
      );
    }
  };

  /*
   * ============================================================
   * วิเคราะห์สีใหม่เมื่อ AI Image เปลี่ยน
   * ============================================================
   */

  useEffect(() => {
    if (!appLogo) {
      setTitleTextColor('#ffffff');

      setTitleTextShadow(
        '0 2px 8px rgba(0,0,0,0.75)'
      );

      return;
    }

    analyzeImageTextColor(appLogo);
  }, [appLogo]);

  /*
   * ============================================================
   * Upload Image
   * ============================================================
   */

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: React.Dispatch<
      React.SetStateAction<string | null>
    >
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setPreview(reader.result as string);
    };

    reader.onerror = () => {
      alert('ไม่สามารถอ่านไฟล์รูปภาพได้');
    };

    reader.readAsDataURL(file);
  };

  /*
   * ============================================================
   * Wait Images
   * ============================================================
   */

  const waitForImages = async (
    element: HTMLElement
  ) => {
    const images = Array.from(
      element.querySelectorAll('img')
    );

    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) {
              resolve();
              return;
            }

            const done = () => {
              img.removeEventListener(
                'load',
                done
              );

              img.removeEventListener(
                'error',
                done
              );

              resolve();
            };

            img.addEventListener(
              'load',
              done
            );

            img.addEventListener(
              'error',
              done
            );

            setTimeout(done, 10000);
          })
      )
    );
  };

  /*
   * ============================================================
   * Wait Fonts
   * ============================================================
   */

  const waitForFonts = async () => {
    if (
      typeof document === 'undefined' ||
      !document.fonts
    ) {
      return;
    }

    try {
      await document.fonts.load(
        '400 16px Anuphan'
      );

      await document.fonts.load(
        '600 19px Anuphan'
      );

      await document.fonts.load(
        '700 28px Anuphan'
      );

      await document.fonts.ready;
    } catch (error) {
      console.warn(
        'ไม่สามารถโหลด Anuphan ได้:',
        error
      );
    }
  };

  /*
   * ============================================================
   * Generate AI Preview
   * ============================================================
   */

  const handlePreviewClick = async () => {
    if (!appNameTH && !appNameEN) {
      alert('กรุณาใส่ชื่อแอปก่อน');
      return;
    }

    if (!orgLogo) {
      alert(
        'กรุณาอัปโหลดโลโก้หน่วยงานก่อน'
      );
      return;
    }

    if (isGenerating) return;

    try {
      setIsGenerating(true);

      setAppLogo(null);

      const response = await fetch(
        '/api/generate',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            appNameTH,
            appNameEN,
            orgLogo,
          }),
        }
      );

      let data: {
        result?: string;
        error?: string;
      };

      try {
        data = await response.json();
      } catch {
        throw new Error(
          'เซิร์ฟเวอร์ส่งข้อมูลกลับมาไม่ถูกต้อง'
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'ไม่สามารถสร้างภาพ AI ได้'
        );
      }

      if (!data?.result) {
        throw new Error(
          'ระบบสร้างภาพไม่ได้ส่งภาพกลับมา'
        );
      }

      setAppLogo(data.result);

      await new Promise<void>(
        (resolve, reject) => {
          const img = new Image();

          img.onload = () => {
            resolve();
          };

          img.onerror = () => {
            reject(
              new Error(
                'ไม่สามารถโหลดภาพ AI ได้'
              )
            );
          };

          img.src =
            data.result as string;
        }
      );

      await waitForFonts();

      setShowPreview(true);
    } catch (err: unknown) {
      console.error(
        'AI generation error:',
        err
      );

      let errorMessage =
        'เกิดข้อผิดพลาดในการสร้างภาพ AI';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (
        typeof err === 'string'
      ) {
        errorMessage = err;
      }

      alert(
        `สร้างภาพ AI ไม่สำเร็จ\n\n${errorMessage}`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  /*
   * ============================================================
   * Create PNG
   * ============================================================
   */

  const createImageWithCanvas = async (
    element: HTMLElement
  ): Promise<string> => {
    await waitForImages(element);

    await waitForFonts();

    await new Promise<void>(
      (resolve) =>
        setTimeout(resolve, 300)
    );

    console.log(
      'กำลังสร้าง PNG ด้วย html-to-image...'
    );

    return await toPng(element, {
      pixelRatio: 3,

      backgroundColor: '#ffffff',

      cacheBust: false,

      skipFonts: false,

      imagePlaceholder: '',

      includeQueryParams: true,

      style: {
        transform: 'none',
      },
    });
  };

  /*
   * ============================================================
   * Data URL -> Blob
   * ============================================================
   */

  const dataUrlToBlob = async (
    dataUrl: string
  ): Promise<Blob> => {
    const response =
      await fetch(dataUrl);

    if (!response.ok) {
      throw new Error(
        'ไม่สามารถแปลง PNG เป็นไฟล์ได้'
      );
    }

    return await response.blob();
  };

  /*
   * ============================================================
   * Download Screen
   * ============================================================
   */

  const downloadScreen = async (
    ref: React.RefObject<
      HTMLDivElement | null
    >,
    filename: string
  ) => {
    if (isDownloading) return;

    if (!ref.current) {
      alert(
        'ไม่พบพื้นที่สำหรับสร้างรูป'
      );

      return;
    }

    const element =
      ref.current;

    const isMobile =
      /Android|iPhone|iPad|iPod/i.test(
        navigator.userAgent
      );

    let newWindow:
      | Window
      | null = null;

    try {
      setIsDownloading(true);

      console.log(
        '================================='
      );

      console.log(
        'เริ่มสร้างภาพ:',
        filename
      );

      console.log(
        'Mobile:',
        isMobile
      );

      if (isMobile) {
        newWindow =
          window.open(
            '',
            '_blank'
          );

        if (!newWindow) {
          alert(
            'เบราว์เซอร์บล็อกหน้าต่างใหม่\n\nกรุณาอนุญาต Pop-up แล้วลองอีกครั้ง'
          );

          return;
        }

        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>กำลังสร้างภาพ...</title>

              <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
              />

              <style>
                body {
                  margin: 0;
                  background: #222;
                  color: white;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  font-family: Arial, sans-serif;
                  text-align: center;
                }
              </style>
            </head>

            <body>

              <div>
                กำลังสร้างภาพ...
                <br />
                กรุณารอสักครู่
              </div>

            </body>

          </html>
        `);

        newWindow.document.close();
      }

      console.log(
        'กำลังรอรูปทั้งหมดโหลด...'
      );

      await waitForImages(
        element
      );

      await waitForFonts();

      await new Promise<void>(
        (resolve) =>
          setTimeout(resolve, 500)
      );

      const dataUrl =
        await createImageWithCanvas(
          element
        );

      if (!dataUrl) {
        throw new Error(
          'ไม่สามารถสร้าง Data URL ได้'
        );
      }

      console.log(
        'สร้าง PNG สำเร็จ'
      );

      if (
        isMobile &&
        newWindow
      ) {
        const safeFilename =
          filename.replace(
            /["<>]/g,
            ''
          );

        newWindow.document.open();

        newWindow.document.write(`
          <!DOCTYPE html>
          <html>

            <head>

              <title>
                ${safeFilename}
              </title>

              <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
              />

              <style>

                * {
                  box-sizing: border-box;
                }

                html,
                body {
                  margin: 0;
                  padding: 0;
                  background: #222;
                  min-height: 100%;
                  font-family: Arial, sans-serif;
                }

                .container {
                  min-height: 100vh;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  padding: 20px;
                }

                img {
                  display: block;
                  max-width: 100%;
                  width: auto;
                  height: auto;
                  border-radius: 8px;
                }

                .text {
                  color: white;
                  text-align: center;
                  margin-top: 16px;
                  font-size: 14px;
                  line-height: 1.6;
                }

              </style>

            </head>

            <body>

              <div class="container">

                <img
                  src="${dataUrl}"
                  alt="${safeFilename}"
                />

                <div class="text">

                  📱 แตะค้างที่รูปภาพ

                  <br />

                  แล้วเลือก
                  "บันทึกภาพ"
                  หรือ
                  "Save Image"

                </div>

              </div>

            </body>

          </html>
        `);

        newWindow.document.close();

        console.log(
          'เปิดรูปสำหรับมือถือสำเร็จ'
        );

        return;
      }

      console.log(
        'กำลังเตรียมไฟล์ดาวน์โหลด...'
      );

      const blob =
        await dataUrlToBlob(
          dataUrl
        );

      const blobUrl =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          'a'
        );

      link.href =
        blobUrl;

      link.download =
        filename;

      link.style.display =
        'none';

      document.body.appendChild(
        link
      );

      await new Promise<void>(
        (resolve) =>
          requestAnimationFrame(
            () => resolve()
          )
      );

      link.click();

      document.body.removeChild(
        link
      );

      setTimeout(() => {
        URL.revokeObjectURL(
          blobUrl
        );
      }, 3000);

      console.log(
        'ดาวน์โหลด PNG สำเร็จ'
      );

      console.log(
        '================================='
      );
    } catch (err: unknown) {
      console.error(
        'Download error:',
        err
      );

      if (
        newWindow &&
        !newWindow.closed
      ) {
        newWindow.close();
      }

      let errorMessage =
        'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';

      if (err instanceof Error) {
        errorMessage =
          err.message;
      } else if (
        typeof err === 'string'
      ) {
        errorMessage = err;
      } else if (
        err &&
        typeof err === 'object'
      ) {
        try {
          errorMessage =
            JSON.stringify(err);
        } catch {
          errorMessage =
            'Browser ไม่สามารถสร้างรูปได้';
        }
      }

      console.error(
        'รายละเอียด Error:',
        errorMessage
      );

      alert(
        `โหลดรูปไม่ได้\n\n${errorMessage}\n\nกรุณาลองกดโหลดรูปอีกครั้ง`
      );
    } finally {
      setIsDownloading(false);
    }
  };

  /*
   * ============================================================
   * PREVIEW
   * ============================================================
   */

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans text-gray-700 flex flex-col items-center overflow-x-auto">

        <div className="w-full max-w-6xl mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">

          <h1 className="text-2xl font-bold text-center sm:text-left">
            ตัวอย่างรูปภาพ (พร้อมดาวน์โหลด)
          </h1>

          <button
            onClick={() =>
              setShowPreview(false)
            }
            className="border border-blue-500 text-blue-500 bg-white hover:bg-blue-50 px-4 py-2 rounded-md transition font-medium cursor-pointer"
          >
            ← กลับไปแก้ไขข้อมูล
          </button>

        </div>

        <div className="w-full max-w-6xl flex flex-wrap justify-center gap-8">

          {/* =====================================================
              SCREEN 1
          ===================================================== */}

          <div className="flex flex-col items-center">

            <div
              ref={screen1Ref}
              className="relative overflow-hidden bg-black"
              style={{
                width: '360px',
                height: '640px',
                fontFamily:
                  'Anuphan, sans-serif',
              }}
            >

              {/* AI IMAGE */}

              {appLogo ? (

                <img
                  src={appLogo}
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="AI generated illustration"
                />

              ) : (

                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">

                  <span className="text-gray-400 text-sm">
                    ภาพประกอบ AI
                  </span>

                </div>

              )}

              {/* TOP GRADIENT */}

              <div
                className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
                style={{
                  height: '190px',

                  background:
                    titleTextColor === '#ffffff'
                      ? 'linear-gradient(to bottom, rgba(0,0,0,0.72), rgba(0,0,0,0.28), transparent)'
                      : 'linear-gradient(to bottom, rgba(255,255,255,0.55), rgba(255,255,255,0.15), transparent)',
                }}
              />

              {/* APP NAME */}

              <div className="absolute top-5 left-4 right-4 z-20">

                <div className="flex items-start gap-3">

                  {/* ORG LOGO */}

                  <div className="w-[55px] h-[62px] flex-shrink-0 flex items-center justify-center">

                    {orgLogo ? (

                      <img
                        src={orgLogo}
                        className="w-full h-full object-contain"
                        alt="Org Logo"
                      />

                    ) : (

                      <div
                        className="w-full h-full flex items-center justify-center text-white text-[8px] font-bold rounded"
                        style={{
                          backgroundColor:
                            themeColor,
                        }}
                      >
                        LOGO
                      </div>

                    )}

                  </div>

                  {/* APP NAME */}

                  <div
                    className="min-w-0 flex-1 pt-0.5"
                    style={{
                      fontFamily:
                        'Anuphan, sans-serif',
                    }}
                  >

                    <h1
                      className="text-[29px] font-bold leading-[1.05] break-words"
                      style={{
                        color:
                          titleTextColor,

                        fontFamily:
                          'Anuphan, sans-serif',

                        letterSpacing:
                          '-0.5px',

                        textShadow:
                          titleTextShadow,
                      }}
                    >
                      {appNameTH ||
                        'ชื่อแอปพลิเคชัน'}
                    </h1>

                    <h2
                      className="text-[18px] font-semibold leading-[1.15] mt-1 break-words"
                      style={{
                        color:
                          titleTextColor,

                        opacity: 0.92,

                        fontFamily:
                          'Anuphan, sans-serif',

                        letterSpacing:
                          '0.2px',

                        textShadow:
                          titleTextShadow,
                      }}
                    >
                      {appNameEN ||
                        'Name App'}
                    </h2>

                  </div>

                </div>

              </div>

              {/* BOTTOM GRADIENT */}

              <div
                className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
                style={{
                  height: '230px',

                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.50), transparent)',
                }}
              />

              {/* FOOTER */}

              <div
                className="absolute bottom-0 left-0 right-0 z-30 h-[115px] px-3 py-2 flex items-center justify-between flex-shrink-0"
                style={{
                  backgroundColor:
                    themeColor,
                }}
              >

                {/* ทางรัฐ LOGO */}

                <div className="w-[72px] h-[72px] bg-white rounded-2xl flex items-center justify-center relative shadow-sm flex-shrink-0 overflow-hidden">

                  <img
                    src="/unnamed.png"
                    className="w-full h-full object-contain"
                    alt="ทางรัฐ"
                  />

                </div>

                {/* QR CODE */}

                <div className="w-[72px] h-[72px] bg-white rounded-lg p-1 flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0">

                  {qrCode ? (

                    <img
                      src={qrCode}
                      className="w-full h-full object-cover rounded"
                      alt="QR Code"
                    />

                  ) : (

                    <div className="w-full h-full border-2 border-dashed border-gray-400 flex flex-col items-center justify-center rounded bg-gray-50">

                      <span className="text-[10px] font-bold text-gray-500">
                        QR ทางรัฐ
                      </span>

                    </div>

                  )}

                </div>

                {/* ทางลัด ถึง รัฐ */}

                <div className="flex-1 flex flex-col items-center justify-center ml-1">

                  <div className="bg-white px-2 py-0.5 rounded-md shadow-sm mb-1 flex items-baseline justify-center">

                    <span className="text-black font-black text-[15px] tracking-tight">
                      ทางลัด
                    </span>

                    <span className="text-gray-500 text-[10px] mx-1">
                      ถึง
                    </span>

                    <span className="text-black font-black text-[15px] tracking-tight">
                      รัฐ
                    </span>

                  </div>

                  <div className="text-white text-[10px] font-bold mb-1 tracking-wider">
                    ช่องทางเดียว
                  </div>

                  <div className="text-white font-bold text-[11px] mb-1.5 flex gap-1">

                    <span>
                      ง่าย
                    </span>

                    <span className="text-red-400">
                      จบ
                    </span>

                    <span className="text-green-300">
                      ครบทุกช่วงวัย
                    </span>

                  </div>

                  <div className="flex gap-1">

                    <div className="w-[52px] h-[16px] bg-black rounded-[4px] flex items-center justify-center text-[5px] text-white font-bold border border-white/30">
                      Google play
                    </div>

                    <div className="w-[52px] h-[16px] bg-black rounded-[4px] flex items-center justify-center text-[5px] text-white font-bold border border-white/30">
                      App Store
                    </div>

                  </div>

                </div>

              </div>

            </div>

            <button
              disabled={isDownloading}
              onClick={() =>
                downloadScreen(
                  screen1Ref,
                  `${appNameEN || 'miniapp'}-screen1.png`
                )
              }
              className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-6 rounded-full text-sm font-bold shadow-md transition cursor-pointer disabled:cursor-not-allowed"
            >
              {isDownloading
                ? 'กำลังสร้างภาพ...'
                : '↓ โหลดภาพส่วนที่ 1'}
            </button>

          </div>

          {/* =====================================================
              SCREEN 2
          ===================================================== */}

          <div className="flex flex-col items-center">

            <div
              ref={screen2Ref}
              className="relative overflow-hidden bg-[#e5f0f9] flex flex-col items-center justify-center"
              style={{
                width: '360px',
                height: '640px',
              }}
            >

              <div className="w-[280px] h-[560px] bg-[#1a1a1a] rounded-[2.5rem] p-2 shadow-xl relative">

                <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden flex items-center justify-center relative">

                  {screenshot ? (

                    <img
                      src={screenshot}
                      className="w-full h-full object-cover"
                      alt="Screenshot"
                    />

                  ) : (

                    <span className="text-gray-400">
                      ภาพแคปหน้าจอ
                    </span>

                  )}

                </div>

              </div>

            </div>

            <button
              disabled={isDownloading}
              onClick={() =>
                downloadScreen(
                  screen2Ref,
                  `${appNameEN || 'miniapp'}-screen2.png`
                )
              }
              className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-6 rounded-full text-sm font-bold shadow-md transition cursor-pointer disabled:cursor-not-allowed"
            >
              {isDownloading
                ? 'กำลังสร้างภาพ...'
                : '↓ โหลดภาพส่วนที่ 2'}
            </button>

          </div>

          {/* =====================================================
              SCREEN 3
          ===================================================== */}

          <div className="flex flex-col items-center">

            <div
              ref={screen3Ref}
              className="relative overflow-hidden"
              style={{
                width: '360px',
                height: '640px',
                fontFamily:
                  'Anuphan, sans-serif',
                backgroundColor:
                  '#111827',
              }}
            >

              {/* =================================================
                  AI BACKGROUND
              ================================================= */}

              {appLogo ? (

                <img
                  src={appLogo}
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="AI background"
                />

              ) : (

                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor:
                      themeColor,
                  }}
                />

              )}

              {/* =================================================
                  OVERLAY
              ================================================= */}

              <div
                className="absolute inset-0 z-10"
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.18) 38%, rgba(0,0,0,0.48) 100%)',
                }}
              />

              {/* =================================================
                  HEADER
                  ไม่มีกรอบสีขาวแล้ว
                  เหลือเฉพาะป้ายหัวข้อสี Theme
              ================================================= */}

              <div
                className="absolute top-[35px] left-[25px] right-[25px] z-40"
              >

                <div
                  className="inline-block px-4 py-1.5 rounded-lg"
                  style={{
                    backgroundColor:
                      themeColor,

                    border:
                      `2px solid ${themeColor}`,

                    boxShadow:
                      '0 3px 10px rgba(0,0,0,0.4)',
                  }}
                >

                  <h1
                    className="font-bold text-[23px] leading-tight whitespace-nowrap"
                    style={{
                      color:
                        '#ffffff',

                      fontFamily:
                        'Anuphan, sans-serif',

                      textShadow:
                        '0 2px 5px rgba(0,0,0,0.45)',
                    }}
                  >
                    การให้บริการประชาชน
                  </h1>

                </div>

              </div>

              {/* =================================================
                  MAIN CONTENT
              ================================================= */}

              <div className="absolute top-[125px] left-[28px] right-[28px] bottom-[105px] z-20">

                {/* =================================================
                    SERVICE HEADER
                ================================================= */}

                <div className="mb-5">

                  <h2
                    className="font-bold text-[24px] leading-tight"
                    style={{
                      color:
                        '#ffffff',

                      fontFamily:
                        'Anuphan, sans-serif',

                      textShadow:
                        '0 3px 8px rgba(0,0,0,0.95)',
                    }}
                  >
                    {headerService ||
                      'บริการจำหน่ายอุปกรณ์ตกปลา'}
                  </h2>

                </div>

                {/* =================================================
                    INTRO
                ================================================= */}

                <div className="mb-5">

                  <p
                    className="font-semibold text-[17px] leading-[1.55]"
                    style={{
                      color:
                        '#ffffff',

                      fontFamily:
                        'Anuphan, sans-serif',

                      textShadow:
                        '0 2px 6px rgba(0,0,0,0.85)',
                    }}
                  >
                    เลือกซื้อสินค้าได้ง่าย
                    <br />
                    สะดวก ครบ จบในที่เดียว
                  </p>

                </div>

                {/* =================================================
                    MAIN SERVICE HEADING
                ================================================= */}

                <div className="mb-4">

                  <h3
                    className="font-bold text-[21px] leading-[1.3]"
                    style={{
                      color:
                        '#ffffff',

                      fontFamily:
                        'Anuphan, sans-serif',

                      textShadow:
                        '0 2px 7px rgba(0,0,0,0.9)',
                    }}
                  >
                    บริการที่สามารถทำได้บน
                    <br />
                    แพลตฟอร์ม
                  </h3>

                </div>

                {/* =================================================
                    DETAIL
                ================================================= */}

                <div className="mb-5">

                  <p
                    className="text-[15px] leading-[1.65]"
                    style={{
                      color:
                        '#ffffff',

                      fontFamily:
                        'Anuphan, sans-serif',

                      textShadow:
                        '0 2px 7px rgba(0,0,0,0.9)',
                    }}
                  >
                    {detail1 ||
                      'เลือกซื้ออุปกรณ์ตกปลาและสินค้าที่เกี่ยวข้องได้ง่าย ครบ จบในร้านเดียว สามารถค้นหาสินค้า เลือกดูคันเบ็ด รอก เหยื่อ และอุปกรณ์ตกปลาได้อย่างสะดวก พร้อมรายละเอียดสินค้าและข้อมูลที่ช่วยให้ตัดสินใจเลือกซื้อออนไลน์ได้ง่ายดาย'}
                  </p>

                </div>

                {/* =================================================
                    FEATURE 1
                ================================================= */}

                <div
                  className="mb-4 pb-3"
                  style={{
                    borderBottom:
                      `2px solid rgba(255,255,255,0.75)`,
                  }}
                >

                  <h4
                    className="font-bold text-[17px] mb-1"
                    style={{
                      color:
                        '#ffffff',

                      fontFamily:
                        'Anuphan, sans-serif',

                      textShadow:
                        '0 2px 6px rgba(0,0,0,0.9)',
                    }}
                  >
                    เลือกซื้อสินค้า
                  </h4>

                  <p
                    className="text-[13px] leading-[1.45]"
                    style={{
                      color:
                        '#ffffff',

                      fontFamily:
                        'Anuphan, sans-serif',

                      textShadow:
                        '0 2px 5px rgba(0,0,0,0.9)',
                    }}
                  >
                    ค้นหาอุปกรณ์ที่ต้องการได้ง่าย
                  </p>

                </div>

                {/* =================================================
                    FEATURE 2
                ================================================= */}

                <div
                  className="pb-3"
                  style={{
                    borderBottom:
                      `2px solid rgba(255,255,255,0.75)`,
                  }}
                >

                  <h4
                    className="font-bold text-[17px] mb-1"
                    style={{
                      color:
                        '#ffffff',

                      fontFamily:
                        'Anuphan, sans-serif',

                      textShadow:
                        '0 2px 6px rgba(0,0,0,0.9)',
                    }}
                  >
                    ดูรายละเอียดสินค้า
                  </h4>

                  <p
                    className="text-[13px] leading-[1.45]"
                    style={{
                      color:
                        '#ffffff',

                      fontFamily:
                        'Anuphan, sans-serif',

                      textShadow:
                        '0 2px 5px rgba(0,0,0,0.9)',
                    }}
                  >
                    ตรวจสอบข้อมูลสินค้า
                    ก่อนสั่งซื้อ
                  </p>

                </div>

              </div>

              {/* =================================================
                  FOOTER LOGOS
              ================================================= */}

              <div
                className="absolute bottom-0 left-0 right-0 z-50"
                style={{
                  height: '88px',

                  background:
                    '#ffffff',

                  borderTop:
                    `4px solid ${themeColor}`,
                }}
              >

                <div
                  className="absolute top-0 left-0 right-0 h-[10px]"
                  style={{
                    backgroundColor:
                      themeColor,
                  }}
                />

                <div className="absolute left-0 right-0 bottom-0 top-[10px] flex items-center justify-center px-4">

                  <div className="w-full flex items-center justify-around">

                    {/* LOGO พันธมิตร */}

                    <div className="w-[72px] h-[58px] flex items-center justify-center">

                      {footerLogo ? (

                        <img
                          src={footerLogo}
                          className="max-w-full max-h-full object-contain"
                          alt="Partner Logo"
                        />

                      ) : (

                        <div
                          className="w-[50px] h-[50px] rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                          style={{
                            backgroundColor:
                              themeColor,
                          }}
                        >
                          LOGO
                        </div>

                      )}

                    </div>

                    {/* DGA */}

                    <div className="w-[78px] flex flex-col items-center justify-center">

                      <div
                        className="font-black text-[25px] leading-none tracking-[-2px]"
                        style={{
                          color:
                            themeColor,

                          fontFamily:
                            'Arial, sans-serif',
                        }}
                      >
                        DGA
                      </div>

                      <div
                        className="text-[5px] font-semibold mt-1 text-center leading-tight"
                        style={{
                          color:
                            '#64748b',

                          fontFamily:
                            'Anuphan, sans-serif',
                        }}
                      >
                        สำนักงานพัฒนารัฐบาลดิจิทัล
                      </div>

                    </div>

                    {/* ทางรัฐ */}

                    <div className="w-[78px] h-[58px] flex items-center justify-center">

                      <img
                        src="/unnamed.png"
                        className="max-w-full max-h-full object-contain"
                        alt="ทางรัฐ"
                      />

                    </div>

                  </div>

                </div>

              </div>

            </div>

            <button
              disabled={isDownloading}
              onClick={() =>
                downloadScreen(
                  screen3Ref,
                  `${appNameEN || 'miniapp'}-screen3.png`
                )
              }
              className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-6 rounded-full text-sm font-bold shadow-md transition cursor-pointer disabled:cursor-not-allowed"
            >
              {isDownloading
                ? 'กำลังสร้างภาพ...'
                : '↓ โหลดภาพส่วนที่ 3'}
            </button>

          </div>

        </div>

      </div>
    );
  }

  /*
   * ============================================================
   * FORM
   * ============================================================
   */

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8 font-sans text-gray-700">

      <div className="max-w-5xl mx-auto">

        <div className="mb-6">

          <h1 className="text-2xl font-bold mb-2">
            สร้าง Screenshot MiniApp
          </h1>

        </div>

        {/* =====================================================
            THEME COLOR
        ===================================================== */}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">

          <div>

            <label className="block text-sm font-bold text-blue-800 mb-1">
              🎨 สีหลักของแอป (Theme Color)
            </label>

            <p className="text-xs text-blue-600">
              เลือกสีเพื่อเปลี่ยนสีแถบด้านล่างและหัวข้อ
            </p>

          </div>

          <input
            type="color"
            value={themeColor}
            onChange={(e) =>
              setThemeColor(e.target.value)
            }
            className="w-16 h-12 p-1 bg-white border border-blue-300 rounded cursor-pointer"
          />

        </div>

        {/* =====================================================
            STEP 1
        ===================================================== */}

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 mb-6">

          <div className="flex items-center text-blue-600 font-bold mb-6">

            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm mr-2 flex-shrink-0">
              1
            </div>

            โลโก้หน่วยงาน / ชื่อแอป

          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            <div className="md:col-span-3 flex flex-col items-center md:items-start">

              <label className="block text-sm text-gray-500 mb-2">
                โลโก้หน่วยงาน
              </label>

              <label className="w-24 h-24 rounded-full bg-gray-100 flex flex-col items-center justify-center text-blue-500 hover:bg-gray-200 transition cursor-pointer overflow-hidden border">

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleImageUpload(
                      e,
                      setOrgLogo
                    )
                  }
                />

                {orgLogo ? (

                  <img
                    src={orgLogo}
                    className="w-full h-full object-contain"
                    alt="Org Logo"
                  />

                ) : (

                  <>

                    <span className="text-2xl">
                      +
                    </span>

                    <span className="text-xs mt-1">
                      อัปโหลด
                    </span>

                  </>

                )}

              </label>

            </div>

            <div className="md:col-span-9 space-y-4 min-w-0">

              <div>

                <label className="block text-sm text-gray-500 mb-1">
                  ชื่อแอปพลิเคชัน (ภาษาไทย)
                </label>

                <input
                  type="text"
                  value={appNameTH}
                  onChange={(e) =>
                    setAppNameTH(
                      e.target.value
                    )
                  }
                  placeholder="เช่น ร้านขายอุปกรณ์ตกปลา"
                  className="w-full max-w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

              </div>

              <div>

                <label className="block text-sm text-gray-500 mb-1">
                  Application Name (English)
                </label>

                <input
                  type="text"
                  value={appNameEN}
                  onChange={(e) =>
                    setAppNameEN(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Fishing Gear Shop"
                  className="w-full max-w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            STEP 2
        ===================================================== */}

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 mb-6">

          <div className="flex items-center text-blue-600 font-bold mb-6">

            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm mr-2 flex-shrink-0">
              2
            </div>

            ภาพแคปหน้าจอแอป (ใส่ในกรอบโทรศัพท์)

          </div>

          <div className="flex flex-col items-center justify-center">

            <label className="w-48 h-[340px] bg-gray-100 rounded-2xl flex flex-col items-center justify-center text-blue-500 hover:bg-gray-200 transition mb-4 cursor-pointer overflow-hidden relative border-2 border-transparent hover:border-blue-300">

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  handleImageUpload(
                    e,
                    setScreenshot
                  )
                }
              />

              {screenshot ? (

                <img
                  src={screenshot}
                  className="w-full h-full object-cover"
                  alt="Screenshot"
                />

              ) : (

                <>

                  <span className="text-3xl">
                    +
                  </span>

                  <span className="text-sm mt-2">
                    อัปโหลดภาพหน้าจอ
                  </span>

                  <span className="text-xs mt-1">
                    (แนวตั้ง 1080×1920)
                  </span>

                </>

              )}

            </label>

          </div>

        </div>

        {/* =====================================================
            STEP 3
        ===================================================== */}

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-8">

          <div className="flex items-center text-blue-600 font-bold mb-6">

            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm mr-2 flex-shrink-0">
              3
            </div>

            รายละเอียดบริการของหน่วยงาน

          </div>

          <div className="space-y-6">

            <div>

              <label className="block text-sm text-gray-500 mb-1">
                Header Service
              </label>

              <input
                type="text"
                value={headerService}
                onChange={(e) =>
                  setHeaderService(
                    e.target.value
                  )
                }
                placeholder="เช่น บริการข้อมูลและซื้ออุปกรณ์ตกปลา"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

            </div>

            {/* DETAIL APP */}

            <div>

              <label className="block text-sm text-gray-500 mb-1">
                Detail App
              </label>

              <textarea
                value={detail1}
                onChange={(e) =>
                  setDetail1(
                    e.target.value
                  )
                }
                placeholder="รายละเอียดบริการ เช่น เลือกซื้ออุปกรณ์ตกปลาและสินค้าที่เกี่ยวข้องได้ง่าย ครบ จบในร้านเดียว..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 h-32 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

            </div>

            {/* FOOTER LOGO + QR */}

            <div className="flex flex-wrap gap-8">

              {/* FOOTER LOGO */}

              <div>

                <label className="block text-sm text-gray-500 mb-2">
                  โลโก้พันธมิตร (แสดงด้านล่าง)
                </label>

                <label className="w-20 h-20 rounded-full bg-gray-100 flex flex-col items-center justify-center text-blue-500 hover:bg-gray-200 transition cursor-pointer overflow-hidden border">

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageUpload(
                        e,
                        setFooterLogo
                      )
                    }
                  />

                  {footerLogo ? (

                    <img
                      src={footerLogo}
                      className="w-full h-full object-contain"
                      alt="Footer Logo"
                    />

                  ) : (

                    <>

                      <span className="text-2xl">
                        +
                      </span>

                      <span className="text-xs mt-1">
                        อัปโหลด
                      </span>

                    </>

                  )}

                </label>

              </div>

              {/* QR CODE */}

              <div>

                <label className="block text-sm text-gray-500 mb-2">
                  QR Code ทางรัฐ
                </label>

                <label className="w-20 h-20 rounded-xl bg-gray-100 flex flex-col items-center justify-center text-blue-500 hover:bg-gray-200 transition cursor-pointer overflow-hidden border">

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageUpload(
                        e,
                        setQrCode
                      )
                    }
                  />

                  {qrCode ? (

                    <img
                      src={qrCode}
                      className="w-full h-full object-cover rounded"
                      alt="QR Code"
                    />

                  ) : (

                    <>

                      <span className="text-2xl">
                        +
                      </span>

                      <span className="text-xs mt-1">
                        QR Code
                      </span>

                    </>

                  )}

                </label>

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            CREATE BUTTON
        ===================================================== */}

        <div className="flex justify-center sm:justify-end pb-12 mt-6">

          <button
            onClick={
              handlePreviewClick
            }
            disabled={
              isGenerating
            }
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-3 px-8 rounded-md flex items-center transition shadow-sm cursor-pointer disabled:cursor-not-allowed"
          >

            {isGenerating
              ? 'กำลังสร้างภาพ...'
              : 'สร้างภาพ'}

            <span className="ml-2">
              {isGenerating
                ? '⏳'
                : '✨'}
            </span>

          </button>

        </div>

      </div>

    </div>
  );
}