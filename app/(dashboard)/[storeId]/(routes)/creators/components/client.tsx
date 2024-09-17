"use client"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
// import { Billboard } from "@prisma/client"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { CreatorColumn, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { ApiList } from "@/components/ui/api-list"

interface CreatorClientProps {
    data: CreatorColumn[]
}

export const CreatorClient: React.FC<CreatorClientProps> = ({
    data
}) => {
    const router = useRouter();
    const params = useParams();
    return (
        <>
            <div className="flex items-center justify-between">
                <Heading
                    title={`Meta data information(${data?.length})`}
                    description="Entering your name for the Ownership" />
                <Button onClick={() => router.push(`/${params.storeId}/creators/new`)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New
                </Button>
            </div>
            <Separator />
            <DataTable columns={columns} data={data} searchKey="name" />
            {/* <Heading title="API" description="API calls for creators" /> */}
            <Separator />
            {/* <ApiList entityName="creators" entityIdName="creatorId" /> */}
        </>
    )
}