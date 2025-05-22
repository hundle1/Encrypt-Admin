import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server"

export async function GET(
    req: Request,
    { params }: { params: { productId: string } }
) {
    try {
        if (!params.productId) {
            return new NextResponse("Product id is required", { status: 400 });
        }
        function withCORS(response: NextResponse) {
            response.headers.set("Access-Control-Allow-Origin", "*"); // hoặc 'http://localhost:3001'
            response.headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
            response.headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
            return response;
        }

        const product = await prismadb.product.findUnique({
            where: { id: params.productId },
            include: {
                images: true,
                category: true,
                type: true,
                creator: true,
                clicks: true // Thêm số lần click vào kết quả
            }
        });

        return withCORS(NextResponse.json(product));
    } catch (err) {
        console.log('[PRODUCT_GET]', err);
        return new NextResponse('Internal error', { status: 500 });
    }
}


export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string, productId: string } }
) {
    try {
        const { userId } = auth();
        const body = await req.json();
        function withCORS(response: NextResponse) {
            response.headers.set("Access-Control-Allow-Origin", "*"); // hoặc 'http://localhost:3001'
            response.headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
            response.headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
            return response;
        }
        const {
            name,
            price,
            categoryId,
            creatorId,
            typeId,
            hashID,
            describe,
            images,
            isFeatured,
            isArchived
        } = body;

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }
        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }
        if (!price) return new NextResponse("Price is required", { status: 400 });
        if (!describe) return new NextResponse("Describe is required", { status: 400 });
        if (!hashID) return new NextResponse("HashID is required", { status: 400 });
        if (!categoryId) return new NextResponse("Category id is required", { status: 400 });
        if (!creatorId) return new NextResponse("Creator id is required", { status: 400 });
        if (!typeId) return new NextResponse("Type id is required", { status: 400 });

        if (!isFeatured) new NextResponse("Featured is required", { status: 400 });
        if (!isArchived) new NextResponse("Archived is required", { status: 400 });

        if (!images || !images.length) {
            return new NextResponse("Image is required", { status: 400 });
        }
        if (!params.productId) {
            return new NextResponse("Product id is required", { status: 400 });
        }
        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        })

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }
        await prismadb.productClick.upsert({
            where: { productId: params.productId },
            update: { count: { increment: 1 } },
            create: { productId: params.productId, userId, count: 1 }
        });
        await prismadb.product.update({
            where: {
                id: params.productId
            },
            data: {
                name,
                images: {
                    deleteMany: {}
                },
                price,
                describe,
                hashID,
                isFeatured,
                isArchived,
                categoryId,
                typeId,
                creatorId,
                storeId: params.storeId
            }
        })

        const product = await prismadb.product.update({
            where: {
                id: params.productId
            },
            data: {
                images: {
                    createMany: {
                        data: [
                            ...images.map((image: { url: string }) => image)
                        ]
                    }
                }
            }
        })

        return withCORS(NextResponse.json(product));
    } catch (err) {
        console.log('[PRODUCT_PATCH]', err)
        return new NextResponse('Internal error', { status: 500 })
    }
}

//// Delete Method

export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string, productId: string } }
) {
    try {
        const { userId } = auth();
        function withCORS(response: NextResponse) {
            response.headers.set("Access-Control-Allow-Origin", "*"); // hoặc 'http://localhost:3001'
            response.headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
            response.headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
            return response;
        }
        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 })
        }

        if (!params.productId) {
            return new NextResponse("Product id is required", { status: 400 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        })

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const product = await prismadb.product.delete({
            where: {
                id: params.productId,
            }
        });


        return withCORS(NextResponse.json(product));
    } catch (err) {
        console.log('[PRODUCT_DELETE]', err)
        return new NextResponse('Internal error', { status: 500 })
    }
}