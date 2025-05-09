"use client"
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { SiEthereum } from 'react-icons/si';

export type ProductColumn = {
    id: string
    name: string
    price: string
    type: string
    hashID: string
    image: string
    category: string
    creator: string
    isFeatured: boolean
    createdAt: string
    clicks: number
}

export const columns: ColumnDef<ProductColumn>[] = [
    {
        accessorKey: 'image',
        header: 'Image',
        cell: ({ row }) => (
            <div className='flex items-center gap-x-2'>
                <img src={row.original.image} className='w-32 h-32 rounded-xl object-scale-down border border-gray-400 ' />
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
        cell: ({ row }) => (
            <div className='flex items-center gap-x-2'>
                <SiEthereum className="text-violet-900" size={18} />
                {Number(row.original.price)?.toLocaleString('en-US', { minimumFractionDigits: 2,maximumFractionDigits: 4,})}
            </div>
        )
    },
    {
        accessorKey: 'category',
        header: 'Category',
    },
    {
        accessorKey: 'createdAt',
        header: 'Date',
    },
    {
        accessorKey: 'clickCount',
        header: 'Watchs',
        cell: ({ row }) => <span>{row.original.clicks || 0} times</span>
    },
    {
        id: 'actions',
        cell: ({ row }) => <CellAction data={row.original} />
    }
]
