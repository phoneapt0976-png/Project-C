'use client';

import React, {
  useState,
  useRef,
  useEffect,
} from 'react';

import '@fontsource/anuphan/400.css';
import '@fontsource/anuphan/600.css';
import '@fontsource/anuphan/700.css';

import { toPng } from 'html-to-image';

export default function MiniAppForm() {
  const [showPreview, setShowPreview] =
    useState(false);

  const [orgLogo, setOrgLogo] =
    useState<string | null>(null);

  const [appLogo, setAppLogo] =
    useState<string | null>(null);

  const [screenshot, setScreenshot] =
    useState<string | null>(null);

  const [footerLogo, setFooterLogo] =
    useState<string | null>(null);

  const [qrCode, setQrCode] =
    useState<string | null>(null);

  const [appNameTH, setAppNameTH] =
    useState('');

  const [appNameEN, setAppNameEN] =
    useState('');

  const [headerService, setHeaderService] =
    useState('');

  const [detail1, setDetail1] =
    useState('');

  const [themeColor, setThemeColor] =
    useState('#0c47a1');

  const [isDownloading, setIsDownloading] =
    useState(false);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [titleTextColor, setTitleTextColor] =
    useState('#ffffff');

  const [titleTextShadow, setTitleTextShadow] =
    useState(
      '0 2px 8px rgba(0,0,0,0.75)'
    );

  const screen1Ref =
    useRef<HTMLDivElement>(null);

  const screen2Ref =
    useRef<HTMLDivElement>(null);

  const screen3Ref =
    useRef<HTMLDivElement>(null);

  /*
   * ==========================================================
   * CONVERT IMAGE URL -> DATA URL
   * ==========================================================
   *
   * สำคัญมากสำหรับ html-to-image
   *
   * ถ้า AI ส่ง URL จากภายนอกโดยตรง
   * html-to-image อาจเจอ CORS / Event
   *
   * เราจึงแปลงเป็น Data URL ก่อน
   */
  const imageToDataUrl = async (
    src: string
  ): Promise<string> => {
    if (!src) {
      throw new Error(
        'ไม่พบแหล่งที่มาของรูปภาพ'
      );
    }

    /*
     * ถ้าเป็น Data URL อยู่แล้ว
     * ไม่ต้องแปลงอีก
     */
    if (
      src.startsWith(
        'data:image/'
      )
    ) {
      return src;
    }

    /*
     * Blob URL ก็ไม่จำเป็นต้อง fetch
     * แต่เพื่อความเสถียรให้พยายามแปลง
     */
    try {
      const response =
        await fetch(src, {
          mode: 'cors',
          cache: 'no-store',
        });

      if (!response.ok) {
        throw new Error(
          `โหลดรูปภาพไม่สำเร็จ (${response.status})`
        );
      }

      const blob =
        await response.blob();

      if (
        !blob.type.startsWith(
          'image/'
        )
      ) {
        throw new Error(
          'ข้อมูลที่ได้รับไม่ใช่ไฟล์รูปภาพ'
        );
      }

      return await new Promise<string>(
        (resolve, reject) => {
          const reader =
            new FileReader();

          reader.onloadend = () => {
            const result =
              reader.result;

            if (
              typeof result ===
              'string'
            ) {
              resolve(result);
            } else {
              reject(
                new Error(
                  'ไม่สามารถแปลงรูปภาพเป็น Data URL ได้'
                )
              );
            }
          };

          reader.onerror = () => {
            reject(
              new Error(
                'ไม่สามารถอ่านข้อมูลรูปภาพได้'
              )
            );
          };

          reader.readAsDataURL(
            blob
          );
        }
      );
    } catch (error) {
      console.warn(
        'ไม่สามารถแปลงรูปภาพเป็น Data URL:',
        error
      );

      /*
       * ถ้าเป็น URL ภายในเว็บ
       * ให้ใช้ URL เดิมได้
       */
      if (
        src.startsWith('/') ||
        src.startsWith(
          window.location.origin
        )
      ) {
        return src;
      }

      throw new Error(
        'ไม่สามารถโหลดภาพ AI สำหรับสร้าง Screenshot ได้ เนื่องจากเซิร์ฟเวอร์ของภาพไม่อนุญาตการเข้าถึงจากเว็บไซต์นี้'
      );
    }
  };

  /*
   * ==========================================================
   * ANALYZE IMAGE TEXT COLOR
   * ==========================================================
   */
  const analyzeImageTextColor =
    async (
      imageSrc: string
    ): Promise<void> => {
      try {
        const safeImageSrc =
          await imageToDataUrl(
            imageSrc
          );

        const img =
          new Image();

        await new Promise<void>(
          (
            resolve,
            reject
          ) => {
            img.onload = () =>
              resolve();

            img.onerror = () =>
              reject(
                new Error(
                  'ไม่สามารถวิเคราะห์สีภาพได้'
                )
              );

            img.src =
              safeImageSrc;
          }
        );

        const canvas =
          document.createElement(
            'canvas'
          );

        const sampleWidth =
          360;

        const sampleHeight =
          190;

        canvas.width =
          sampleWidth;

        canvas.height =
          sampleHeight;

        const ctx =
          canvas.getContext(
            '2d'
          );

        if (!ctx) return;

        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          Math.min(
            img.height,
            (img.width /
              sampleWidth) *
              sampleHeight
          ),
          0,
          0,
          sampleWidth,
          sampleHeight
        );

        const imageData =
          ctx.getImageData(
            0,
            0,
            sampleWidth,
            sampleHeight
          );

        const data =
          imageData.data;

        let totalLuminance = 0;
        let totalWeight = 0;

        for (
          let y = 0;
          y < sampleHeight;
          y += 4
        ) {
          for (
            let x = 0;
            x < sampleWidth;
            x += 4
          ) {
            const index =
              (y *
                sampleWidth +
                x) *
              4;

            const r =
              data[index];

            const g =
              data[index + 1];

            const b =
              data[index + 2];

            const a =
              data[index + 3];

            if (a < 50) continue;

            const luminance =
              0.2126 * r +
              0.7152 * g +
              0.0722 * b;

            const centerDistance =
              Math.abs(
                x -
                  sampleWidth /
                    2
              ) /
              (sampleWidth / 2);

            const weight =
              1 -
              centerDistance *
                0.25;

            totalLuminance +=
              luminance *
              weight;

            totalWeight +=
              weight;
          }
        }

        if (totalWeight === 0) {
          setTitleTextColor(
            '#ffffff'
          );

          setTitleTextShadow(
            '0 2px 8px rgba(0,0,0,0.75)'
          );

          return;
        }

        const averageLuminance =
          totalLuminance /
          totalWeight;

        if (
          averageLuminance <
          145
        ) {
          setTitleTextColor(
            '#ffffff'
          );

          setTitleTextShadow(
            '0 2px 8px rgba(0,0,0,0.8)'
          );
        } else {
          setTitleTextColor(
            '#111827'
          );

          setTitleTextShadow(
            '0 2px 8px rgba(255,255,255,0.75)'
          );
        }
      } catch (error) {
        console.warn(
          'วิเคราะห์สีภาพไม่สำเร็จ',
          error
        );

        setTitleTextColor(
          '#ffffff'
        );

        setTitleTextShadow(
          '0 2px 8px rgba(0,0,0,0.75)'
        );
      }
    };

  useEffect(() => {
    if (!appLogo) {
      setTitleTextColor(
        '#ffffff'
      );

      setTitleTextShadow(
        '0 2px 8px rgba(0,0,0,0.75)'
      );

      return;
    }

    analyzeImageTextColor(
      appLogo
    );
  }, [appLogo]);

  /*
   * ==========================================================
   * REMOVE WHITE BACKGROUND
   * ==========================================================
   */
  const removeWhiteBackground = (
    dataUrl: string,
    tolerance = 30
  ): Promise<string> => {
    return new Promise(
      (
        resolve,
        reject
      ) => {
        const img =
          new Image();

        img.onload = () => {
          try {
            const width =
              img.naturalWidth ||
              img.width;

            const height =
              img.naturalHeight ||
              img.height;

            const canvas =
              document.createElement(
                'canvas'
              );

            canvas.width =
              width;

            canvas.height =
              height;

            const ctx =
              canvas.getContext(
                '2d',
                {
                  willReadFrequently:
                    true,
                }
              );

            if (!ctx) {
              reject(
                new Error(
                  'ไม่สามารถสร้าง Canvas ได้'
                )
              );

              return;
            }

            ctx.drawImage(
              img,
              0,
              0,
              width,
              height
            );

            const imageData =
              ctx.getImageData(
                0,
                0,
                width,
                height
              );

            const data =
              imageData.data;

            const isWhiteLike = (
              index: number
            ) => {
              const r =
                data[index];

              const g =
                data[index + 1];

              const b =
                data[index + 2];

              const a =
                data[index + 3];

              if (a === 0)
                return false;

              return (
                r >=
                  255 -
                    tolerance &&
                g >=
                  255 -
                    tolerance &&
                b >=
                  255 -
                    tolerance
              );
            };

            const visited =
              new Uint8Array(
                width * height
              );

            const queue: number[] =
              [];

            const addIfBackground = (
              x: number,
              y: number
            ) => {
              if (
                x < 0 ||
                x >= width ||
                y < 0 ||
                y >= height
              ) {
                return;
              }

              const pixel =
                y * width + x;

              if (
                visited[pixel]
              ) {
                return;
              }

              const index =
                pixel * 4;

              if (
                !isWhiteLike(
                  index
                )
              ) {
                return;
              }

              visited[pixel] = 1;

              queue.push(pixel);
            };

            for (
              let x = 0;
              x < width;
              x++
            ) {
              addIfBackground(
                x,
                0
              );

              addIfBackground(
                x,
                height - 1
              );
            }

            for (
              let y = 0;
              y < height;
              y++
            ) {
              addIfBackground(
                0,
                y
              );

              addIfBackground(
                width - 1,
                y
              );
            }

            let queueIndex = 0;

            while (
              queueIndex <
              queue.length
            ) {
              const pixel =
                queue[
                  queueIndex++
                ];

              const x =
                pixel % width;

              const y =
                Math.floor(
                  pixel / width
                );

              addIfBackground(
                x + 1,
                y
              );

              addIfBackground(
                x - 1,
                y
              );

              addIfBackground(
                x,
                y + 1
              );

              addIfBackground(
                x,
                y - 1
              );
            }

            for (
              let pixel = 0;
              pixel <
              visited.length;
              pixel++
            ) {
              if (
                visited[pixel]
              ) {
                data[
                  pixel * 4 + 3
                ] = 0;
              }
            }

            ctx.putImageData(
              imageData,
              0,
              0
            );

            resolve(
              canvas.toDataURL(
                'image/png'
              )
            );
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => {
          reject(
            new Error(
              'ไม่สามารถโหลดรูปภาพเพื่อทำพื้นหลังโปร่งใสได้'
            )
          );
        };

        img.src =
          dataUrl;
      }
    );
  };

  /*
   * ==========================================================
   * IMAGE UPLOAD
   * ==========================================================
   */
  const handleImageUpload =
    async (
      e: React.ChangeEvent<HTMLInputElement>,
      setPreview: React.Dispatch<
        React.SetStateAction<
          string | null
        >
      >,
      removeBackground = false
    ) => {
      const file =
        e.target.files?.[0];

      if (!file) return;

      if (
        !file.type.startsWith(
          'image/'
        )
      ) {
        alert(
          'กรุณาเลือกไฟล์รูปภาพ'
        );

        return;
      }

      const reader =
        new FileReader();

      reader.onloadend =
        async () => {
          try {
            const dataUrl =
              reader.result as string;

            if (
              removeBackground
            ) {
              const transparentLogo =
                await removeWhiteBackground(
                  dataUrl
                );

              setPreview(
                transparentLogo
              );
            } else {
              setPreview(
                dataUrl
              );
            }
          } catch (error) {
            console.error(
              'ไม่สามารถทำพื้นหลังโลโก้ให้โปร่งใส:',
              error
            );

            setPreview(
              reader.result as string
            );
          }
        };

      reader.onerror = () => {
        alert(
          'ไม่สามารถอ่านไฟล์รูปภาพได้'
        );
      };

      reader.readAsDataURL(
        file
      );

      e.target.value = '';
    };

  /*
   * ==========================================================
   * WAIT FOR IMAGES
   * ==========================================================
   *
   * เวอร์ชันใหม่จะตรวจ naturalWidth ด้วย
   * เพื่อไม่ให้ complete=true แต่รูปโหลดเสีย
   */
  const waitForImages =
    async (
      element: HTMLElement
    ) => {
      const images =
        Array.from(
          element.querySelectorAll(
            'img'
          )
        );

      await Promise.all(
        images.map(
          async (img, index) => {
            if (
              img.complete &&
              img.naturalWidth > 0
            ) {
              try {
                if (
                  typeof img.decode ===
                  'function'
                ) {
                  await img.decode();
                }
              } catch {
                // decode บาง browser อาจ reject
                // แต่รูปยังใช้งานได้
              }

              return;
            }

            await new Promise<void>(
              (
                resolve,
                reject
              ) => {
                let finished =
                  false;

                const cleanup =
                  () => {
                    img.removeEventListener(
                      'load',
                      handleLoad
                    );

                    img.removeEventListener(
                      'error',
                      handleError
                    );
                  };

                const handleLoad =
                  async () => {
                    if (
                      finished
                    )
                      return;

                    finished = true;

                    cleanup();

                    try {
                      if (
                        typeof img.decode ===
                        'function'
                      ) {
                        await img.decode();
                      }
                    } catch {
                      // ignore decode error
                    }

                    resolve();
                  };

                const handleError =
                  () => {
                    if (
                      finished
                    )
                      return;

                    finished = true;

                    cleanup();

                    reject(
                      new Error(
                        `ไม่สามารถโหลดรูปภาพหมายเลข ${
                          index + 1
                        } ได้`
                      )
                    );
                  };

                img.addEventListener(
                  'load',
                  handleLoad
                );

                img.addEventListener(
                  'error',
                  handleError
                );

                setTimeout(
                  () => {
                    if (
                      finished
                    )
                      return;

                    finished = true;

                    cleanup();

                    if (
                      img.naturalWidth >
                      0
                    ) {
                      resolve();
                    } else {
                      reject(
                        new Error(
                          `รูปภาพหมายเลข ${
                            index + 1
                          } โหลดไม่สำเร็จหรือใช้เวลานานเกินไป`
                        )
                      );
                    }
                  },
                  15000
                );
              }
            );
          }
        )
      );
    };

  /*
   * ==========================================================
   * WAIT FOR FONTS
   * ==========================================================
   */
  const waitForFonts =
    async () => {
      if (
        typeof document ===
          'undefined' ||
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
   * ==========================================================
   * GENERATE PREVIEW
   * ==========================================================
   */
  const handlePreviewClick =
    async () => {
      if (
        !appNameTH &&
        !appNameEN
      ) {
        alert(
          'กรุณาใส่ชื่อแอปก่อน'
        );

        return;
      }

      if (!orgLogo) {
        alert(
          'กรุณาอัปโหลดโลโก้หน่วยงานก่อน'
        );

        return;
      }

      if (isGenerating) {
        return;
      }

      try {
        setIsGenerating(
          true
        );

        setAppLogo(null);

        const response =
          await fetch(
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
          data =
            await response.json();
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

        /*
         * ======================================================
         * IMPORTANT
         * ======================================================
         *
         * แปลงภาพ AI เป็น Data URL ตั้งแต่ตรงนี้
         * เพื่อป้องกัน html-to-image เจอ CORS/Event
         */
        let safeAppLogo: string;

        try {
          safeAppLogo =
            await imageToDataUrl(
              data.result
            );
        } catch (imageError) {
          console.error(
            'AI image conversion error:',
            imageError
          );

          throw new Error(
            'สร้างภาพ AI สำเร็จ แต่ไม่สามารถเตรียมภาพสำหรับ Screenshot ได้'
          );
        }

        setAppLogo(
          safeAppLogo
        );

        /*
         * ตรวจสอบภาพก่อนแสดง Preview
         */
        await new Promise<void>(
          (
            resolve,
            reject
          ) => {
            const img =
              new Image();

            img.onload =
              async () => {
                try {
                  if (
                    typeof img.decode ===
                    'function'
                  ) {
                    await img.decode();
                  }
                } catch {
                  // ignore
                }

                if (
                  img.naturalWidth <=
                  0
                ) {
                  reject(
                    new Error(
                      'ภาพ AI ไม่มีข้อมูลรูปภาพที่ถูกต้อง'
                    )
                  );

                  return;
                }

                resolve();
              };

            img.onerror =
              () =>
                reject(
                  new Error(
                    'ไม่สามารถโหลดภาพ AI ได้'
                  )
                );

            img.src =
              safeAppLogo;
          }
        );

        await waitForFonts();

        /*
         * ให้ React render appLogo ใหม่ก่อน
         * แล้วค่อยเปิด Preview
         */
        await new Promise<void>(
          (resolve) =>
            requestAnimationFrame(
              () =>
                requestAnimationFrame(
                  () => resolve()
                )
            )
        );

        setShowPreview(
          true
        );
      } catch (
        err: unknown
      ) {
        console.error(
          'AI generation error:',
          err
        );

        let errorMessage =
          'เกิดข้อผิดพลาดในการสร้างภาพ AI';

        if (
          err instanceof Error
        ) {
          errorMessage =
            err.message;
        } else if (
          typeof err ===
          'string'
        ) {
          errorMessage =
            err;
        }

        alert(
          `สร้างภาพ AI ไม่สำเร็จ\n\n${errorMessage}`
        );
      } finally {
        setIsGenerating(
          false
        );
      }
    };

  /*
   * ==========================================================
   * CREATE PNG
   * ==========================================================
   */
  const createImageWithCanvas =
    async (
      element: HTMLElement
    ): Promise<string> => {
      const isMobile =
        /Android|iPhone|iPad|iPod/i.test(
          navigator.userAgent
        );

      const renderRatio =
        isMobile ? 1.5 : 3;

      /*
       * รอรูป + font
       */
      await waitForImages(
        element
      );

      await waitForFonts();

      /*
       * ตรวจรูปทุกตัวอีกครั้ง
       */
      const images =
        Array.from(
          element.querySelectorAll(
            'img'
          )
        );

      for (
        const img of images
      ) {
        if (
          !img.complete ||
          img.naturalWidth <= 0
        ) {
          throw new Error(
            'มีรูปภาพที่ยังโหลดไม่สมบูรณ์ กรุณาลองดาวน์โหลดอีกครั้ง'
          );
        }

        /*
         * ถ้าเป็น external URL
         * พยายามเปลี่ยนเป็น Data URL
         *
         * โดยเฉพาะภาพ AI
         */
        const src =
          img.getAttribute(
            'src'
          );

        if (
          src &&
          !src.startsWith(
            'data:image/'
          ) &&
          !src.startsWith(
            'blob:'
          ) &&
          !src.startsWith('/')
        ) {
          try {
            const safeSrc =
              await imageToDataUrl(
                src
              );

            img.setAttribute(
              'src',
              safeSrc
            );

            await new Promise<void>(
              (
                resolve,
                reject
              ) => {
                const testImg =
                  new Image();

                testImg.onload =
                  () =>
                    resolve();

                testImg.onerror =
                  () =>
                    reject(
                      new Error(
                        'ไม่สามารถโหลดรูปภาพสำหรับสร้าง PNG ได้'
                      )
                    );

                testImg.src =
                  safeSrc;
              }
            );
          } catch (error) {
            console.warn(
              'ไม่สามารถแปลงรูปภาพ external:',
              error
            );

            throw new Error(
              'พบรูปภาพภายนอกที่ไม่สามารถนำมาสร้าง Screenshot ได้'
            );
          }
        }
      }

      await new Promise<void>(
        (resolve) =>
          requestAnimationFrame(
            () =>
              requestAnimationFrame(
                () =>
                  resolve()
              )
          )
      );

      /*
       * สร้าง PNG
       */
      return await toPng(
        element,
        {
          pixelRatio:
            renderRatio,

          backgroundColor:
            '#ffffff',

          cacheBust: true,

          skipFonts: false,

          imagePlaceholder:
            '',

          includeQueryParams:
            true,

          style: {
            transform:
              'none',
          },

          filter: () => {
            return true;
          },
        }
      );
    };

  /*
   * ==========================================================
   * DATA URL -> BLOB
   * ==========================================================
   */
  const dataUrlToBlob =
    async (
      dataUrl: string
    ): Promise<Blob> => {
      const response =
        await fetch(
          dataUrl
        );

      if (!response.ok) {
        throw new Error(
          'ไม่สามารถแปลง PNG เป็นไฟล์ได้'
        );
      }

      return await response.blob();
    };

  /*
   * ==========================================================
   * MOBILE DOWNLOAD
   * ==========================================================
   */
  const downloadOnMobile =
    async (
      blob: Blob,
      filename: string
    ) => {
      const file =
        new File(
          [blob],
          filename,
          {
            type: 'image/png',
          }
        );

      /*
       * IOS / ANDROID SHARE
       */
      if (
        typeof navigator !==
          'undefined' &&
        'share' in navigator &&
        'canShare' in navigator
      ) {
        try {
          const shareNavigator =
            navigator as Navigator & {
              share?: (data: {
                files?: File[];
                title?: string;
                text?: string;
              }) => Promise<void>;

              canShare?: (data: {
                files?: File[];
              }) => boolean;
            };

          const canShareFile =
            shareNavigator.canShare?.({
              files: [file],
            });

          if (
            canShareFile &&
            shareNavigator.share
          ) {
            await shareNavigator.share({
              files: [file],
              title: filename,
            });

            return;
          }
        } catch (error) {
          if (
            error instanceof
              DOMException &&
            error.name ===
              'AbortError'
          ) {
            return;
          }

          console.warn(
            'Mobile Share ไม่สำเร็จ:',
            error
          );
        }
      }

      /*
       * FALLBACK
       */
      const blobUrl =
        URL.createObjectURL(
          blob
        );

      const newWindow =
        window.open(
          '',
          '_blank'
        );

      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html lang="th">
            <head>
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
              />

              <title>
                ${filename}
              </title>

              <style>
                * {
                  box-sizing: border-box;
                }

                html,
                body {
                  margin: 0;
                  padding: 0;
                  width: 100%;
                  min-height: 100%;
                  background: #111;
                  font-family: Arial, sans-serif;
                }

                body {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: flex-start;
                  padding: 16px;
                  gap: 14px;
                }

                .topbar {
                  width: 100%;
                  max-width: 600px;
                  color: white;
                  text-align: center;
                  font-size: 14px;
                  line-height: 1.5;
                }

                .image-wrapper {
                  width: 100%;
                  display: flex;
                  justify-content: center;
                }

                img {
                  display: block;
                  width: auto;
                  max-width: 100%;
                  height: auto;
                  max-height: calc(100vh - 120px);
                  object-fit: contain;
                }

                .download-btn {
                  display: inline-block;
                  background: white;
                  color: #111827;
                  text-decoration: none;
                  padding: 12px 20px;
                  border-radius: 12px;
                  font-size: 14px;
                  font-weight: 700;
                }
              </style>
            </head>

            <body>
              <div class="topbar">
                แตะค้างที่รูปภาพ
                แล้วเลือก
                <strong>บันทึกรูปภาพ</strong>
                เพื่อบันทึกลงมือถือ
              </div>

              <div class="image-wrapper">
                <img
                  src="${blobUrl}"
                  alt="${filename}"
                />
              </div>

              <a
                class="download-btn"
                href="${blobUrl}"
                download="${filename}"
              >
                ดาวน์โหลดรูปภาพ
              </a>
            </body>
          </html>
        `);

        newWindow.document.close();

        setTimeout(() => {
          URL.revokeObjectURL(
            blobUrl
          );
        }, 60000);

        return;
      }

      /*
       * Popup blocked
       */
      window.location.href =
        blobUrl;

      setTimeout(() => {
        URL.revokeObjectURL(
          blobUrl
        );
      }, 60000);
    };

  /*
   * ==========================================================
   * DOWNLOAD SCREEN
   * ==========================================================
   */
  const downloadScreen =
    async (
      ref: React.RefObject<
        HTMLDivElement | null
      >,
      filename: string
    ) => {
      if (isDownloading) {
        return;
      }

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

      try {
        setIsDownloading(
          true
        );

        /*
         * รอ React / browser
         */
        await new Promise<void>(
          (resolve) =>
            requestAnimationFrame(
              () => resolve()
            )
        );

        await waitForImages(
          element
        );

        await waitForFonts();

        await new Promise<void>(
          (resolve) =>
            setTimeout(
              resolve,
              500
            )
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

        const blob =
          await dataUrlToBlob(
            dataUrl
          );

        if (!blob) {
          throw new Error(
            'ไม่สามารถสร้างไฟล์ PNG ได้'
          );
        }

        /*
         * MOBILE
         */
        if (isMobile) {
          await downloadOnMobile(
            blob,
            filename
          );

          return;
        }

        /*
         * DESKTOP
         */
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
              () =>
                resolve()
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
        }, 5000);
      } catch (
        err: unknown
      ) {
        console.error(
          'Download error:',
          err
        );

        let errorMessage =
          'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';

        if (
          err instanceof Error
        ) {
          errorMessage =
            err.message;
        } else if (
          typeof err ===
          'string'
        ) {
          errorMessage =
            err;
        } else if (
          err &&
          typeof err ===
            'object' &&
          'message' in err
        ) {
          errorMessage =
            String(
              (
                err as {
                  message?: unknown;
                }
              ).message
            );
        }

        alert(
          `โหลดรูปไม่ได้\n\n${errorMessage}\n\nกรุณาลองกดโหลดรูปอีกครั้ง`
        );
      } finally {
        setIsDownloading(
          false
        );
      }
    };

  /*
   * ==========================================================
   * PREVIEW
   * ==========================================================
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

              <div
                className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
                style={{
                  height: '190px',
                  background:
                    titleTextColor ===
                    '#ffffff'
                      ? 'linear-gradient(to bottom, rgba(0,0,0,0.72), rgba(0,0,0,0.28), transparent)'
                      : 'linear-gradient(to bottom, rgba(255,255,255,0.55), rgba(255,255,255,0.15), transparent)',
                }}
              />

              <div className="absolute top-5 left-4 right-4 z-20">

                <div className="flex items-start gap-3">

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

              <div
                className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
                style={{
                  height: '230px',
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.50), transparent)',
                }}
              />

              <div
                className="absolute bottom-0 left-0 right-0 z-30 h-[115px] px-3 py-2 flex items-center justify-between flex-shrink-0"
                style={{
                  backgroundColor:
                    themeColor,
                }}
              >

                <div className="w-[72px] h-[72px] bg-white rounded-2xl flex items-center justify-center relative shadow-sm flex-shrink-0 overflow-hidden">

                  <img
                    src="/unnamed.png"
                    className="w-full h-full object-contain"
                    alt="ทางรัฐ"
                  />

                </div>

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
                        QR DGA
                      </span>

                    </div>
                  )}

                </div>

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
              disabled={
                isDownloading
              }
              onClick={() =>
                downloadScreen(
                  screen1Ref,
                  `${
                    appNameEN ||
                    'miniapp'
                  }-screen1.png`
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

                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 z-30 bg-[#1a1a1a]"
                    style={{
                      width: '130px',
                      height: '16px',
                      borderRadius:
                        '0 0 12px 12px',
                    }}
                  >

                    <div
                      className="absolute left-1/2 top-[5px] -translate-x-1/2"
                      style={{
                        width: '34px',
                        height: '3px',
                        borderRadius:
                          '999px',
                        backgroundColor:
                          '#333333',
                      }}
                    />

                  </div>

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
              disabled={
                isDownloading
              }
              onClick={() =>
                downloadScreen(
                  screen2Ref,
                  `${
                    appNameEN ||
                    'miniapp'
                  }-screen2.png`
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

              <div
                className="absolute inset-0 z-10"
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.18) 38%, rgba(0,0,0,0.48) 100%)',
                }}
              />

              <div className="absolute top-[35px] left-[25px] right-[25px] z-40 flex justify-center">

                <h1
                  className="font-bold text-[23px] leading-tight whitespace-nowrap"
                  style={{
                    color:
                      '#ffffff',
                    fontFamily:
                      'Anuphan, sans-serif',
                    textShadow:
                      '0 3px 8px rgba(0,0,0,0.95)',
                  }}
                >
                  การให้บริการประชาชน
                </h1>

              </div>

              <div
                className="absolute top-[120px] left-[28px] right-[28px] bottom-[100px] z-20 overflow-hidden"
              >

                <div className="mb-3">

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

                <div className="mb-3">

                  <p
                    className="font-semibold text-[17px] leading-[1.45]"
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

                <div className="mb-2">

                  <h3
                    className="font-bold text-[21px] leading-[1.25]"
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

                <div className="mb-3">

                  <p
                    className="text-[15px] leading-[1.5]"
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

                <div className="mb-3 pb-2">

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
                    className="text-[13px] leading-[1.4]"
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

                <div className="pb-2">

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
                    className="text-[13px] leading-[1.4]"
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

              <div
                className="absolute bottom-0 left-0 right-0 z-50"
                style={{
                  height: '88px',
                  background:
                    '#ffffff',
                }}
              >

                <div className="absolute inset-0 flex items-center justify-center px-4">

                  <div className="w-full flex items-center justify-around">

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
              disabled={
                isDownloading
              }
              onClick={() =>
                downloadScreen(
                  screen3Ref,
                  `${
                    appNameEN ||
                    'miniapp'
                  }-screen3.png`
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
   * ==========================================================
   * FORM PAGE
   * ==========================================================
   */

  return (
    <div
      className="min-h-screen text-gray-800"
      style={{
        fontFamily:
          'Anuphan, sans-serif',
        background:
          'linear-gradient(135deg, #f8fafc 0%, #eef5ff 45%, #f8fafc 100%)',
      }}
    >

      <div className="fixed inset-0 pointer-events-none overflow-hidden">

        <div
          className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full blur-3xl opacity-40"
          style={{
            backgroundColor:
              themeColor,
          }}
        />

        <div className="absolute top-[45%] -left-40 w-[360px] h-[360px] rounded-full bg-blue-100 blur-3xl opacity-50" />

      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        <div className="mb-8">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

            <div className="max-w-3xl">

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-blue-100 shadow-sm mb-4">

                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      themeColor,
                  }}
                />

                <span className="text-xs sm:text-sm font-semibold text-gray-600">
                  MiniApp Design Generator
                </span>

              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-tight">

                สร้าง Screenshot
                <br />

                <span
                  style={{
                    color:
                      themeColor,
                  }}
                >
                  MiniApp ของคุณ
                </span>

              </h1>

              <p className="mt-4 text-sm sm:text-base text-gray-500 leading-relaxed max-w-2xl">

                กรอกข้อมูลเพียงไม่กี่ขั้นตอน
                ระบบจะสร้างภาพตัวอย่าง MiniApp
                พร้อมภาพประกอบ AI
                ให้พร้อมใช้งานและดาวน์โหลด

              </p>

            </div>

          </div>

        </div>

        <div className="bg-white/85 backdrop-blur-xl border border-white rounded-2xl shadow-sm p-3 sm:p-4 mb-7">

          <div className="grid grid-cols-3 gap-2 sm:gap-4">

            <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-xl bg-blue-50">

              <div
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm"
                style={{
                  backgroundColor:
                    themeColor,
                }}
              >
                01
              </div>

              <div className="min-w-0">

                <div className="text-[10px] sm:text-xs text-gray-400">
                  STEP 01
                </div>

                <div className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                  ข้อมูล MiniApp
                </div>

              </div>

            </div>

            <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-xl">

              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-bold flex-shrink-0">
                02
              </div>

              <div className="min-w-0">

                <div className="text-[10px] sm:text-xs text-gray-400">
                  STEP 02
                </div>

                <div className="text-xs sm:text-sm font-bold text-gray-600 truncate">
                  ภาพหน้าจอ
                </div>

              </div>

            </div>

            <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-xl">

              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-bold flex-shrink-0">
                03
              </div>

              <div className="min-w-0">

                <div className="text-[10px] sm:text-xs text-gray-400">
                  STEP 03
                </div>

                <div className="text-xs sm:text-sm font-bold text-gray-600 truncate">
                  รายละเอียด
                </div>

              </div>

            </div>

          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">

          <div className="space-y-6">

            {/* THEME COLOR */}

            <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">

              <div className="p-5 sm:p-6">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                  <div className="flex items-center gap-3">

                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm"
                      style={{
                        backgroundColor:
                          themeColor,
                      }}
                    >
                      🎨
                    </div>

                    <div>

                      <h2 className="font-bold text-gray-900">
                        สีหลักของแอป
                      </h2>

                      <p className="text-xs text-gray-400 mt-0.5">
                        Theme Color
                      </p>

                    </div>

                  </div>

                  <div className="flex items-center gap-3">

                    <div
                      className="w-10 h-10 rounded-xl border border-white shadow-md"
                      style={{
                        backgroundColor:
                          themeColor,
                      }}
                    />

                    <div>

                      <div className="text-xs text-gray-400">
                        สีที่เลือก
                      </div>

                      <div className="text-sm font-bold text-gray-700 uppercase">
                        {themeColor}
                      </div>

                    </div>

                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) =>
                        setThemeColor(
                          e.target.value
                        )
                      }
                      className="w-12 h-10 p-1 bg-white border border-gray-200 rounded-xl cursor-pointer"
                    />

                  </div>

                </div>

                <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-100">

                  <div className="flex items-center gap-2">

                    <span className="text-xs">
                      💡
                    </span>

                    <p className="text-xs text-gray-500">
                      สีนี้จะถูกนำไปใช้กับส่วนต่าง ๆ
                      ของ Screenshot เช่น Footer
                      และหัวข้อบริการ
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* MINIAPP INFO */}

            <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">

              <div className="px-5 sm:px-6 py-5 border-b border-gray-100">

                <div className="flex items-center gap-3">

                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
                    style={{
                      backgroundColor:
                        themeColor,
                    }}
                  >
                    1
                  </div>

                  <div>

                    <h2 className="text-lg font-bold text-gray-900">
                      ข้อมูล MiniApp
                    </h2>

                    <p className="text-xs text-gray-400 mt-0.5">
                      โลโก้หน่วยงานและชื่อแอปพลิเคชัน
                    </p>

                  </div>

                  <div className="ml-auto hidden sm:block">

                    <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[11px] font-semibold">
                      Required
                    </span>

                  </div>

                </div>

              </div>

              <div className="p-5 sm:p-6">

                <div className="grid grid-cols-1 md:grid-cols-[150px_minmax(0,1fr)] gap-7">

                  <div>

                    <label className="block text-xs font-semibold text-gray-500 mb-3">
                      โลโก้หน่วยงาน
                    </label>

                    <label
                      className={`group relative w-32 h-32 rounded-3xl flex flex-col items-center justify-center transition cursor-pointer overflow-hidden ${
                        orgLogo
                          ? 'bg-transparent'
                          : 'bg-gray-50 border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                    >

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImageUpload(
                            e,
                            setOrgLogo,
                            true
                          )
                        }
                      />

                      {orgLogo ? (
                        <>
                          <img
                            src={orgLogo}
                            className="w-full h-full object-contain"
                            alt="Org Logo"
                          />

                          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">

                            <span className="text-white text-xs font-semibold">
                              เปลี่ยนโลโก้
                            </span>

                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl shadow-sm"
                            style={{
                              backgroundColor:
                                themeColor,
                            }}
                          >
                            +
                          </div>

                          <span className="text-xs font-semibold text-gray-500 mt-2">
                            อัปโหลดโลโก้
                          </span>
                        </>
                      )}

                    </label>

                    <p className="text-[10px] text-gray-400 leading-relaxed mt-2">
                      ระบบจะลบพื้นหลังสีขาว
                      <br />
                      อัตโนมัติ
                    </p>

                  </div>

                  <div className="space-y-5 min-w-0">

                    <div>

                      <label className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2">

                        <span>
                          ชื่อแอปพลิเคชัน (ภาษาไทย)
                        </span>

                        <span className="text-gray-300">
                          TH
                        </span>

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
                        className="w-full h-12 border border-gray-200 bg-gray-50/70 rounded-xl px-4 text-sm text-gray-800 placeholder:text-gray-300 outline-none transition focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                      />

                    </div>

                    <div>

                      <label className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2">

                        <span>
                          Application Name (English)
                        </span>

                        <span className="text-gray-300">
                          EN
                        </span>

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
                        className="w-full h-12 border border-gray-200 bg-gray-50/70 rounded-xl px-4 text-sm text-gray-800 placeholder:text-gray-300 outline-none transition focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                      />

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* SCREENSHOT */}

            <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">

              <div className="px-5 sm:px-6 py-5 border-b border-gray-100">

                <div className="flex items-center gap-3">

                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
                    style={{
                      backgroundColor:
                        themeColor,
                    }}
                  >
                    2
                  </div>

                  <div>

                    <h2 className="text-lg font-bold text-gray-900">
                      ภาพแคปหน้าจอแอป
                    </h2>

                    <p className="text-xs text-gray-400 mt-0.5">
                      ภาพจะถูกใส่ลงในกรอบโทรศัพท์
                    </p>

                  </div>

                </div>

              </div>

              <div className="p-5 sm:p-6">

                <div className="flex flex-col sm:flex-row items-center gap-6">

                  <label className="group relative w-52 h-[350px] bg-gray-50 rounded-[2rem] flex flex-col items-center justify-center text-blue-500 transition cursor-pointer overflow-hidden border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/40">

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
                      <>
                        <img
                          src={screenshot}
                          className="w-full h-full object-cover"
                          alt="Screenshot"
                        />

                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">

                          <span className="text-white text-xs font-semibold">
                            เปลี่ยนภาพ
                          </span>

                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl text-blue-500">
                          ↑
                        </div>

                        <span className="text-sm font-semibold text-gray-600 mt-3">
                          อัปโหลดภาพหน้าจอ
                        </span>

                        <span className="text-xs text-gray-400 mt-1">
                          แนวตั้ง 1080 × 1920
                        </span>
                      </>
                    )}

                  </label>

                  <div className="flex-1 w-full">

                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">

                      <div className="flex items-center gap-3 mb-4">

                        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
                          📱
                        </div>

                        <div>

                          <h3 className="text-sm font-bold text-gray-800">
                            Phone Preview
                          </h3>

                          <p className="text-xs text-gray-400">
                            iPhone-style frame
                          </p>

                        </div>

                      </div>

                      <div className="space-y-3">

                        <div className="flex items-center gap-3">

                          <div className="w-2 h-2 rounded-full bg-green-400" />

                          <span className="text-xs text-gray-500">
                            รองรับไฟล์รูปภาพทั่วไป
                          </span>

                        </div>

                        <div className="flex items-center gap-3">

                          <div className="w-2 h-2 rounded-full bg-blue-400" />

                          <span className="text-xs text-gray-500">
                            ภาพจะถูกครอบให้พอดีกับกรอบ
                          </span>

                        </div>

                        <div className="flex items-center gap-3">

                          <div className="w-2 h-2 rounded-full bg-purple-400" />

                          <span className="text-xs text-gray-500">
                            แนะนำภาพแนวตั้ง
                          </span>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* SERVICE DETAILS */}

            <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">

              <div className="px-5 sm:px-6 py-5 border-b border-gray-100">

                <div className="flex items-center gap-3">

                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
                    style={{
                      backgroundColor:
                        themeColor,
                    }}
                  >
                    3
                  </div>

                  <div>

                    <h2 className="text-lg font-bold text-gray-900">
                      รายละเอียดบริการ
                    </h2>

                    <p className="text-xs text-gray-400 mt-0.5">
                      ข้อมูลที่จะปรากฏใน Screenshot ส่วนที่ 3
                    </p>

                  </div>

                </div>

              </div>

              <div className="p-5 sm:p-6 space-y-6">

                <div>

                  <label className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2">

                    <span>
                      Header Service
                    </span>

                    <span className="text-gray-300">
                      HEADER
                    </span>

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
                    className="w-full h-12 border border-gray-200 bg-gray-50/70 rounded-xl px-4 text-sm text-gray-800 placeholder:text-gray-300 outline-none transition focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  />

                </div>

                <div>

                  <label className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2">

                    <span>
                      Detail App
                    </span>

                    <span className="text-gray-300">
                      CONTENT
                    </span>

                  </label>

                  <textarea
                    value={detail1}
                    onChange={(e) =>
                      setDetail1(
                        e.target.value
                      )
                    }
                    placeholder="รายละเอียดบริการ เช่น เลือกซื้ออุปกรณ์ตกปลาและสินค้าที่เกี่ยวข้องได้ง่าย ครบ จบในร้านเดียว..."
                    className="w-full border border-gray-200 bg-gray-50/70 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-300 h-36 resize-none outline-none transition focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  />

                  <div className="flex justify-end mt-1.5">

                    <span className="text-[10px] text-gray-400">
                      {detail1.length} ตัวอักษร
                    </span>

                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">

                    <label className="block text-xs font-semibold text-gray-500 mb-3">
                      โลโก้พันธมิตร
                    </label>

                    <label
                      className={`group relative w-24 h-24 rounded-2xl flex flex-col items-center justify-center text-blue-500 transition cursor-pointer overflow-hidden ${
                        footerLogo
                          ? 'bg-transparent'
                          : 'bg-white border-2 border-dashed border-gray-200 hover:border-blue-300'
                      }`}
                    >

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImageUpload(
                            e,
                            setFooterLogo,
                            true
                          )
                        }
                      />

                      {footerLogo ? (
                        <>
                          <img
                            src={footerLogo}
                            className="w-full h-full object-contain"
                            alt="Footer Logo"
                          />

                          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">

                            <span className="text-white text-[10px] font-semibold">
                              เปลี่ยน
                            </span>

                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl">
                            +
                          </span>

                          <span className="text-xs font-semibold text-gray-500 mt-1">
                            อัปโหลด
                          </span>
                        </>
                      )}

                    </label>

                    <p className="text-[10px] text-gray-400 mt-2">
                      ลบพื้นหลังสีขาวอัตโนมัติ
                    </p>

                  </div>

                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">

                    <label className="block text-xs font-semibold text-gray-500 mb-3">
                      QR Code ทางรัฐ
                    </label>

                    <label className="group relative w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-blue-500 hover:border-blue-300 transition cursor-pointer overflow-hidden">

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
                        <>
                          <img
                            src={qrCode}
                            className="w-full h-full object-cover"
                            alt="QR Code"
                          />

                          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">

                            <span className="text-white text-[10px] font-semibold">
                              เปลี่ยน
                            </span>

                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl">
                            +
                          </span>

                          <span className="text-xs font-semibold text-gray-500 mt-1">
                            QR Code
                          </span>
                        </>
                      )}

                    </label>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* SUMMARY */}

          <div className="lg:sticky lg:top-6 space-y-5">

            <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">

              <div className="p-5">

                <div className="flex items-center justify-between mb-5">

                  <div>

                    <h2 className="font-bold text-gray-900">
                      Project Summary
                    </h2>

                    <p className="text-xs text-gray-400 mt-0.5">
                      สรุปข้อมูลที่กรอก
                    </p>

                  </div>

                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
                    style={{
                      backgroundColor:
                        themeColor,
                    }}
                  >
                    ✦
                  </div>

                </div>

                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 mb-4">

                  <div className="flex items-center gap-3">

                    <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">

                      {orgLogo ? (
                        <img
                          src={orgLogo}
                          className="w-full h-full object-contain"
                          alt="Logo"
                        />
                      ) : (
                        <span className="text-gray-300 text-xl">
                          +
                        </span>
                      )}

                    </div>

                    <div className="min-w-0">

                      <div className="text-[10px] text-gray-400 uppercase font-semibold">
                        Application
                      </div>

                      <div className="text-sm font-bold text-gray-800 truncate mt-0.5">
                        {appNameTH ||
                          'ชื่อแอปพลิเคชัน'}
                      </div>

                      <div className="text-[11px] text-gray-400 truncate">
                        {appNameEN ||
                          'Application Name'}
                      </div>

                    </div>

                  </div>

                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">

                  <span className="text-xs text-gray-500">
                    Theme Color
                  </span>

                  <div className="flex items-center gap-2">

                    <span className="text-[10px] text-gray-400 uppercase">
                      {themeColor}
                    </span>

                    <span
                      className="w-5 h-5 rounded-full border border-white shadow"
                      style={{
                        backgroundColor:
                          themeColor,
                      }}
                    />

                  </div>

                </div>

                <div className="py-3 space-y-3">

                  <div className="flex items-center justify-between">

                    <span className="text-xs text-gray-500">
                      โลโก้หน่วยงาน
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        orgLogo
                          ? 'bg-green-50 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {orgLogo
                        ? 'พร้อม'
                        : 'ยังไม่มี'}
                    </span>

                  </div>

                  <div className="flex items-center justify-between">

                    <span className="text-xs text-gray-500">
                      ภาพหน้าจอ
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        screenshot
                          ? 'bg-green-50 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {screenshot
                        ? 'พร้อม'
                        : 'ยังไม่มี'}
                    </span>

                  </div>

                  <div className="flex items-center justify-between">

                    <span className="text-xs text-gray-500">
                      รายละเอียดบริการ
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        headerService ||
                        detail1
                          ? 'bg-green-50 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {headerService ||
                      detail1
                        ? 'พร้อม'
                        : 'ยังไม่มี'}
                    </span>

                  </div>

                </div>

              </div>

              <div
                className="h-2"
                style={{
                  backgroundColor:
                    themeColor,
                }}
              />

            </div>

          </div>

        </div>

        {/* CREATE BUTTON */}

        <div className="mt-8 pb-8">

          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-4 sm:p-5">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

              <div className="flex items-center gap-3">

                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0"
                  style={{
                    backgroundColor:
                      themeColor,
                  }}
                >
                  ✨
                </div>

                <div>

                  <div className="text-sm font-bold text-gray-800">
                    พร้อมสร้าง Screenshot แล้วหรือยัง?
                  </div>

                  <div className="text-xs text-gray-400 mt-0.5">
                    ระบบจะสร้างภาพประกอบ AI
                    และเปิดหน้า Preview ให้ทันที
                  </div>

                </div>

              </div>

              <button
                onClick={
                  handlePreviewClick
                }
                disabled={
                  isGenerating
                }
                className="w-full sm:w-auto min-w-[210px] h-12 px-7 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5 hover:shadow-xl disabled:bg-gray-400 disabled:hover:translate-y-0 cursor-pointer disabled:cursor-not-allowed"
                style={{
                  backgroundColor:
                    isGenerating
                      ? '#9ca3af'
                      : themeColor,
                }}
              >

                {isGenerating ? (
                  <>
                    <span className="animate-spin">
                      ◌
                    </span>

                    <span>
                      กำลังสร้างภาพ...
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      สร้าง Screenshot
                    </span>

                    <span>
                      ✨
                    </span>
                  </>
                )}

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}