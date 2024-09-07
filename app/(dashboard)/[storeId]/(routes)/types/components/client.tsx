"use client"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
// import { Billboard } from "@prisma/client"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { TypeColumn, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { ApiList } from "@/components/ui/api-list"

interface TypeClientProps {
    data: TypeColumn[]
}

export const TypeClient: React.FC<TypeClientProps> = ({
    data
}) => {
    const router = useRouter();
    const params = useParams();
    return (
        <>
            <div className="flex items-center justify-between">
                <Heading
                    title={`Types (${data?.length})`}
                    description="Manage types for your store"/>
                <Button onClick={() => router.push(`/${params.storeId}/types/new`)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New
                </Button>
            </div>
            <Separator />
            <DataTable columns={columns} data={data} searchKey="name" />
            <Heading title="API" description="API calls for Types" />
            <Separator />
            <ApiList entityName="types" entityIdName="typeId" />
        </>
    )
}