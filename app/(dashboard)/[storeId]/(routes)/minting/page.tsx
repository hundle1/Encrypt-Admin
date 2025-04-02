import prismadb from '@/lib/prismadb';
import { MintingForm } from './components/minting-form';

const MintingPage = async ({
    params
}: {
    params: { storeId: string }
}) => {
    const products = await prismadb.product.findMany({
        where: {
            storeId: params.storeId,
        },
        select: {
            id: true,
            name: true,
            describe: true,
            price: true,
            hashID: true,
            typeId: true,
            createdAt: true,
            images: true,
            creator: { select: { name: true } },
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    

    return (
        <div className="flex-col">
            <div className="flex-1 p-8 pt-6 space-y-4">
                <MintingForm products={products} />
            </div>
        </div>
    );
};


export default MintingPage;
