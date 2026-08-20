import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { v2 as cloudinary } from "cloudinary";

const uploadMenuPath = "/.netlify/functions/upload-menu";

// Lee el body manualmente porque este middleware corre dentro de Vite y no tiene express.json().
const readRequestBody = (req) =>
  new Promise<string>((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => resolve(body));
    req.on("error", reject);
  });

const maskSensitiveText = (value) =>
  String(value).replace(/api_key\s+["']?[^"'\s,}]+/gi, "api_key [hidden]");

const getErrorDetails = (error) => {
  if (error && typeof error === "object") {
    const maybeError = error as {
      name?: unknown;
      message?: unknown;
      http_code?: unknown;
      error?: unknown;
      stack?: unknown;
    };

    return {
      name: String(maybeError.name || "CloudinaryError"),
      message: maskSensitiveText(
        maybeError.message || maybeError.error || "Image upload failed"
      ),
      httpCode: maybeError.http_code,
      stack: typeof maybeError.stack === "string" ? maybeError.stack : undefined,
      raw: maskSensitiveText(JSON.stringify(error)),
    };
  }

  if (!(error instanceof Error)) {
    return {
      message: "Image upload failed",
      raw: String(error),
    };
  }

  return {
    name: error.name,
    message: maskSensitiveText(error.message),
    httpCode: "http_code" in error ? error.http_code : undefined,
    stack: error.stack,
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga tambien variables sin prefijo VITE_ para poder usar secretos de Cloudinary solo en el servidor local.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      {
        name: "local-netlify-upload-menu",
        configureServer(server) {
          // En local Vite responde la misma ruta que Netlify usa en produccion.
          server.middlewares.use(uploadMenuPath, async (req, res) => {
            let uploadDebug = {};

            console.log("[upload-menu:local] Request received", {
              method: req.method,
              url: req.url,
            });

            if (req.method !== "POST") {
              console.log("[upload-menu:local] Rejected method", req.method);
              res.statusCode = 405;
              res.end(JSON.stringify({ error: "Method not allowed" }));
              return;
            }

            try {
              console.log("[upload-menu:local] Env check", {
                hasCloudName: Boolean(env.CLOUDINARY_CLOUD_NAME),
                hasApiKey: Boolean(env.CLOUDINARY_API_KEY),
                hasApiSecret: Boolean(env.CLOUDINARY_API_SECRET),
              });

              if (
                !env.CLOUDINARY_CLOUD_NAME ||
                !env.CLOUDINARY_API_KEY ||
                !env.CLOUDINARY_API_SECRET
              ) {
                console.warn("[upload-menu:local] Cloudinary env vars not configured, skipping upload");
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({
                  error: "Cloudinary no está configurado. Agrega CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en .env.development",
                }));
                return;
              }

              cloudinary.config({
                cloud_name: env.CLOUDINARY_CLOUD_NAME,
                api_key: env.CLOUDINARY_API_KEY,
                api_secret: env.CLOUDINARY_API_SECRET,
              });

              const rawBody = await readRequestBody(req);
              console.log("[upload-menu:local] Raw body received", {
                bodyLength: rawBody.length,
              });

              const parsedBody = JSON.parse(rawBody);
              const { image, id } = parsedBody;
              const imagePrefix =
                typeof image === "string" ? image.slice(0, 40) : "";

              uploadDebug = {
                hasCloudName: Boolean(env.CLOUDINARY_CLOUD_NAME),
                hasApiKey: Boolean(env.CLOUDINARY_API_KEY),
                hasApiSecret: Boolean(env.CLOUDINARY_API_SECRET),
                hasImage: Boolean(image),
                imageLength: typeof image === "string" ? image.length : 0,
                imagePrefix,
                id,
                publicId: `menu-${id}`,
              };

              console.log("[upload-menu:local] Parsed body", uploadDebug);

              if (!image) {
                throw new Error("No image provided");
              }

              if (!id) {
                throw new Error("No id provided");
              }

              console.log("[upload-menu:local] Uploading to Cloudinary", {
                publicId: `menu-${id}`,
              });

              const result = await cloudinary.uploader.upload(image, {
                public_id: `menu-${id}`,
                overwrite: true,
                invalidate: true,
              });

              console.log("[upload-menu:local] Upload success", {
                publicId: result.public_id,
                secureUrl: result.secure_url,
              });

              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ url: result.secure_url }));
            } catch (error) {
              const details = getErrorDetails(error);

              console.error("[upload-menu:local] Upload failed", {
                ...uploadDebug,
                error: details,
              });

              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  error: details.message,
                  details,
                  debug: uploadDebug,
                })
              );
            }
          });
        },
      },
    ],
  };
});
