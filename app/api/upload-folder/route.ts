import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file size (100MB limit for Pinata free tier)
        if (file.size > 100 * 1024 * 1024) {
            return NextResponse.json({ error: "File size exceeds 100MB" }, { status: 400 });
        }

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Prepare form data for Pinata
        const pinataFormData = new FormData();
        pinataFormData.append("file", buffer, {
            filename: file.name || "folder_upload.zip",
            contentType: file.type || "application/zip",
        });
        pinataFormData.append(
            "pinataMetadata",
            JSON.stringify({ name: file.name || "folder_upload.zip" })
        );
        pinataFormData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

        // Ensure JWT is present
        if (!process.env.PINATA_JWT_TOKEN) {
            return NextResponse.json({ error: "Pinata JWT not configured" }, { status: 500 });
        }

        const response = await axios.post(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            pinataFormData,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PINATA_JWT_TOKEN}`,
                    ...pinataFormData.getHeaders(),
                },
            }
        );

        console.log("Upload successful:", response.data);

        return NextResponse.json({ ipfsHash: response.data.IpfsHash }, { status: 200 });
    } catch (error: any) {
        // Improved error handling
        const errorMessage =
            error.response?.data?.error?.details || // Pinata-specific error details
            error.response?.data?.error ||
            error.message ||
            "Unknown error occurred during upload";
        console.error("Upload error:", errorMessage, error);
        return NextResponse.json(
            { error: `Failed to upload to Pinata: ${errorMessage}` },
            { status: error.response?.status || 500 }
        );
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};