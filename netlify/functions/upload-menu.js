import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const handler = async (event) => {
    try {
        const { image } = JSON.parse(event.body);

        const result = await cloudinary.uploader.upload(image, {
            public_id: "menu",   // 🔥 nombre fijo
            overwrite: true,     // 🔥 sobrescribe siempre
            invalidate: true,    // 🔥 limpia cache CDN
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ url: result.secure_url }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
