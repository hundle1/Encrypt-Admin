"use client"
import { ColumnDef } from '@tanstack/react-table';

export type OrderColumn = {
    id: string
    phone: string
    address: string
    isPaid: boolean
    totalPrice: string
    products: string
    createdAt: string
}

export const columns: ColumnDef<OrderColumn>[] = [
    {
        accessorKey: 'products',
        header: 'Products',
    },
    {
        accessorKey: 'phone',
        header: 'Email Address',
    },
    {
        accessorKey: 'address',
        header: 'Wallet Address',
    },
    {
        accessorKey: 'totalPrice',
        header: 'Total Price',
    },
    {
        accessorKey: 'isPaid',
        header: 'Paid',
    },
    {
        accessorKey: 'createdAt',
        header: 'Date',
    }
]