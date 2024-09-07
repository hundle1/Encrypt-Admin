import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const { userId } = auth();
        const body = await req.json();

        const {
            name,
            price,
            categoryId,
            creatorId,
            typeId,
            images,
            isFeatured,
            isArchived
        } = body; 

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400});
        }

        if (!price) new NextResponse("Price is required", { status: 400});

        if (!categoryId) new NextResponse("Category id is required", { status: 400});

        if (!creatorId) new NextResponse("Color id is required", { status: 400});

        if (!typeId) new NextResponse("Size id is required", { status: 400});

        if (!isFeatured) new NextResponse("Featured is required", { status: 400});

        if (!isArchived) new NextResponse("Archived is required", { status: 400});

        if (!images || !images.length) {
            return new NextResponse("Image is required", { status: 400});
        }

        if (!params.storeId) {
            return new NextResponse("Store Id is required", { status: 400});
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

        const product = await prismadb.product.create({
            data : {
                name,
                images: {
                    createMany: {
                        data: [
                            ...images.map((image: { url:string }) => image)
                        ]
                    }
                },
                price,
                isFeatured,
                isArchived,
                categoryId,
                typeId,
                creatorId,
                storeId: params.storeId
            }
        })

        return NextResponse.json(product);

    } catch (err) {
        console.log(`[PRODUCTS_POST] ${err}`);
        return new NextResponse(`Internal error`, { status: 500})
    }
}

export async function GET(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get('categoryId') || undefined;
        const typeId = searchParams.get('typeId') || undefined;
        const creatorId = searchParams.get('creatorId') || undefined;
        const isFeatured = searchParams.get('isFeatured');

        if (!params.storeId) {
            return new NextResponse("Store Id is required", { status: 400});
        }

        const products = await prismadb.product.findMany({
            where: {
                storeId: params.storeId,
                categoryId,
                creatorId,
                typeId,
                isFeatured: isFeatured ? true : undefined,
                isArchived: false
            },
            include: {
                images: true,
                category: true,
                creator: true,
                type: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(products);

    } catch (err) {
        console.log(`[PRODUCTS_GET] ${err}`);
        return new NextResponse(`Internal error`, { status: 500})
    }
}