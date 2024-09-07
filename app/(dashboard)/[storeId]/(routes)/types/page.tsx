import { format } from 'date-fns'
import prismadb from '@/lib/prismadb'
import { TypeClient } from './components/client'
import { TypeColumn } from './components/columns'

const TypesPage = async ({ 
    params
}: { 
    params: { storeId: string }
}) => {

    const types = await prismadb.type.findMany({
        where: {
            storeId: params.storeId,
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const formattedSizes: TypeColumn[] = types.map(item => ({
        id: item.id,
        name: item.name,
        createdAt: format(item.createdAt, "MMMM do, yyyy"),
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 p-8 pt-6 space-y-4">
                <TypeClient data={formattedSizes} />
            </div>
        </div>
    )
}

export default TypesPage;