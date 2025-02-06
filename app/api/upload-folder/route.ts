import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function POST(req: Request) {
    try {
        const { folderPath } = await req.json();

        if (!folderPath) {
            return NextResponse.json({ error: "Missing folderPath" }, { status: 400 });
        }

        // Đường dẫn thực tế trên server (Cần chỉnh sửa tùy hệ thống)
        const serverFolderPath = path.join(process.cwd(), "uploads", folderPath);

        // Chạy script Python
        const pythonProcess = spawn("python3", ["scripts/upload.py", serverFolderPath]);

        let output = "";
        pythonProcess.stdout.on("data", (data) => {
            output += data.toString();
        });

        return new Promise((resolve) => {
            pythonProcess.on("close", async () => {
                try {
                    const response = JSON.parse(output.trim());
                    resolve(NextResponse.json(response));
                } catch (err) {
                    resolve(NextResponse.json({ error: "Failed to process Python response" }, { status: 500 }));
                }
            });
        });
    } catch (err) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
