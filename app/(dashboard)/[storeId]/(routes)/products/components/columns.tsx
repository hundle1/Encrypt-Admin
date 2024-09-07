"use client"
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';

export type ProductColumn = {
    id: string
    name: string
    price: string
    type: string
    image: string
    category: string
    creator: string
    isFeatured: boolean
    createdAt: string
}

export const columns: ColumnDef<ProductColumn>[] = [
    {
        accessorKey: 'image',
        header: 'Image',
        cell: ({ row }) => (
            <div className='flex items-center gap-x-2'>
                <img src={row.original.image} className='w-32 h-32 rounded-xl object-scale-down border border-gray-400' />
            </div>
        )
    },
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'isFeatured',
        header: 'Featured',
    },
    {
        accessorKey: 'price',
        header: 'Price',
    },
    {
        accessorKey: 'category',
        header: 'Category',
    },
    {
        accessorKey: 'type',
        header: 'Type',
    },
    {
        accessorKey: 'creator',
        header: 'Creator',
    },
    {
        accessorKey: 'createdAt',
        header: 'Date',
    },
    {
        id: 'actions',
        cell: ({ row }) => <CellAction data={row.original} />
    }
]