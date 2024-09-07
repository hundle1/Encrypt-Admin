import { format } from 'date-fns'
import prismadb from '@/lib/prismadb'
import { ProductClient } from './components/client'
import { ProductColumn } from './components/columns'
import { formatter } from '@/lib/utils'

const ProductsPage = async ({ 
    params
}: { 
    params: { storeId: string }
}) => {

    const products = await prismadb.product.findMany({
        where: {
            storeId: params.storeId,
        },
        include: {
            category: true,
            images: true,
            type: true,
            creator: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const formattedProducts: ProductColumn[] = products.map(item => ({
        id: item.id,
        name: item.name,
        image: item.images[0].url,
        isFeatured: item.isFeatured,
        isArchived: item.isArchived,
        price: formatter.format(Number(item.price)),
        category: item.category.name,
        type: item.type.name,
        creator: item.creator.name,
        createdAt: format(item.createdAt, "MMMM do, yyyy"),
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 p-8 pt-6 space-y-4">
                <ProductClient data={formattedProducts} />
            </div>
        </div>
    )
}

export default ProductsPage;