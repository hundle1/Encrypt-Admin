import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

// Hàm OPTIONS để xử lý preflight request
export async function OPTIONS() {
    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "http://localhost:3001");
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    return new NextResponse(null, { status: 204, headers });
}

export async function POST(
    req: Request,
    { params }: { params: { storeId: string; productId: string } }
) {
    try {
        if (!params.productId) {
            return new NextResponse(
                JSON.stringify({ error: "Product id is required" }),
                { status: 400, headers: { "Access-Control-Allow-Origin": "http://localhost:3001" } }
            );
        }

        // Kiểm tra product có tồn tại không
        const product = await prismadb.product.findUnique({
            where: { id: params.productId },
        });

        if (!product) {
            return new NextResponse(
                JSON.stringify({ error: "Product not found" }),
                { status: 404, headers: { "Access-Control-Allow-Origin": "http://localhost:3001" } }
            );
        }

        // Upsert record click
        const clickRecord = await prismadb.productClick.upsert({
            where: { productId: params.productId },
            update: { count: { increment: 1 } },
            create: { productId: params.productId, count: 1 }
        });

        // Trả về header CORS cùng response
        return NextResponse.json(
            { message: "Click recorded", data: clickRecord },
            { headers: { "Access-Control-Allow-Origin": "http://localhost:3001" } }
        );
    } catch (err) {
        console.error("🔥 [ERROR] Product Click API:", err);
        return new NextResponse(
            JSON.stringify({ error: "Internal Server Error" }),
            { status: 500, headers: { "Access-Control-Allow-Origin": "http://localhost:3001" } }
        );
    }
}
