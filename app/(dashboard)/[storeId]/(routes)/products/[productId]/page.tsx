import prismadb from "@/lib/prismadb";
import { ProductForm } from "./components/product-form";

const ProductPage = async ({ params }: { params: { productId: string, storeId: string } }) => {
    const product = await prismadb.product.findUnique({ 
        where: {
            id: params.productId
        },
        include: {
            images: true,
            files: true
        }
    });

    const categories = await prismadb.category.findMany({
        where: {
            storeId: params.storeId
        },
    })

    const types = await prismadb.type.findMany({
        where: {
            storeId: params.storeId
        },
    })

    const creators = await prismadb.creator.findMany({
        where: {
            storeId: params.storeId
        },
    })

    return (
        <div className="flex-col">
            <div className="flex-1 p-8 pt-6 space-y-4">
                <ProductForm
                    initialData={product}
                    creators={creators}
                    types={types}
                    categories={categories}
                />
            </div>
        </div>
    )
}

export default ProductPage;