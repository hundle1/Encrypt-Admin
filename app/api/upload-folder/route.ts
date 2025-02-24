import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as Blob | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Convert Blob to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Prepare form data for Pinata
        const pinataFormData = new FormData();
        pinataFormData.append("file", buffer, "stack_market.zip");

        const response = await axios.post(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            pinataFormData,
            {
                headers: {
                    "Content-Type": `multipart/form-data; boundary=${pinataFormData.getBoundary()}`,
                    Authorization: `Bearer ${process.env.PINATA_JWT_TOKEN}`,
                },
            }
        );

        console.log("Upload successful:", response.data);

        return NextResponse.json({ ipfsHash: response.data.IpfsHash });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Failed to upload to Pinata" }, { status: 500 });
    }
}
