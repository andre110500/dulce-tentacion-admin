import { v2 as cloudinary } from "cloudinary";

console.log("🔵 Function loaded");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const handler = async (event) => {
    console.log("🟢 Function invoked");

    try {
        console.log("ENV CHECK:", {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key_exists: !!process.env.CLOUDINARY_API_KEY,
            api_secret_exists: !!process.env.CLOUDINARY_API_SECRET,
        });

        console.log("Raw event.body:", event.body);

        const parsedBody = JSON.parse(event.body || "{}");
        console.log("Parsed body keys:", Object.keys(parsedBody));

        const { image, id } = parsedBody;

        if (!image) {
            console.log("❌ No image received");
            throw new Error("No image provided");
        }

        if (!id) {
            console.log("❌ No id received");
            throw new Error("No id provided");
        }

        console.log(`📤 Uploading to Cloudinary for id: ${id}`);

        const result = await cloudinary.uploader.upload(image, {
            public_id: `menu-${id}`, // 🔥 dinámico por id
            overwrite: true,
            invalidate: true,
        });

        console.log("✅ Upload success!");
        console.log("Cloudinary response:", {
            public_id: result.public_id,
            version: result.version,
            secure_url: result.secure_url,
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ url: result.secure_url }),
        };

    } catch (error) {
        console.error("🔥 ERROR UPLOADING IMAGE:");
        console.error(error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message,
                stack: error.stack,
            }),
        };
    }
};

