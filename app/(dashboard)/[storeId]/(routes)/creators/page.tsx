import { format } from 'date-fns'
import prismadb from '@/lib/prismadb'
import { CreatorClient } from './components/client'
import { CreatorColumn } from './components/columns'

const CreatorsPage = async ({ 
    params
}: { 
    params: { storeId: string }
}) => {

    const creators = await prismadb.creator.findMany({
        where: {
            storeId: params.storeId,
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const formattedCreators: CreatorColumn[] = creators.map(item => ({
        id: item.id,
        name: item.name,
        createdAt: format(item.createdAt, "MMMM do, yyyy"),
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 p-8 pt-6 space-y-4">
                <CreatorClient data={formattedCreators} />
            </div>
        </div>
    )
}

export default CreatorsPage;