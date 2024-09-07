"use client"
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';

export type BillboardColumn = {
    id: string
    label: string
    imageUrl:   string
    createdAt: string
}

export const columns: ColumnDef<BillboardColumn>[] = [
    {
        accessorKey: 'label',
        header: 'Label',
    },
    {
        accessorKey: '  imageUrl',
        header: 'Image',
        cell: ({ row }) => <img className="w-20 h-20 object-cover" src={String(row.original.imageUrl)} />
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