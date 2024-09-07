import prismadb from "@/lib/prismadb";
import { CreatorForm } from "./components/creator-form";

const ColorPage = async ({ params }: { params: { creatorId: string } }) => {
    const creator = await prismadb.creator.findUnique({ 
        where: {
            id: params.creatorId
        }
    });

    return (
        <div className="flex-col">
            <div className="flex-1 p-8 pt-6 space-y-4">
                <CreatorForm initialData={creator} />
            </div>
        </div>
    )
}

export default ColorPage;