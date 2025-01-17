"use client"
import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
export type OrderColumn = {
    id: string
    phone: string
    address: string
    isPaid: boolean
    totalPrice: string
    products: string
    createdAt: string
}
const supabase = createClient('https://gnoymmbmksrtfyhqfwcn.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdub3ltbWJta3NydGZ5aHFmd2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg1NTk1NzgsImV4cCI6MjAzNDEzNTU3OH0.W-eqpaifek48wkviTOZeBLTwG3sIOkKbjblo74SCK34');
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
        accessorKey: 'createdAt',
        header: 'Date',
    },
    {
        accessorKey: 'checkingTime',
        header: 'Checking Time',
        cell: ({ row }) => {
            const [timeLeft, setTimeLeft] = useState<number | null>(null);
            useEffect(() => {
                const createdAtDate = new Date(row.original.createdAt);
                const endTime = new Date(createdAtDate.getTime() + 45 * 60000);
                console.log(endTime);
                const intervalId = setInterval(async () => {
                    const { data, error } = await supabase.rpc('current_timestamp');
                    if (error) {
                        console.error('Error fetching server time:', error);
                        return;
                    }
                    const now = new Date(data.current_timestamp);
                    if (endTime > now) {
                        const timeDiff = endTime.getTime() - now.getTime();
                        setTimeLeft(Math.floor(timeDiff / 1000));
                    } else {
                        setTimeLeft(0);
                        clearInterval(intervalId);
                    }
                }, 1000);
                return () => clearInterval(intervalId);
            }, [row.original.createdAt]);
            return timeLeft === 0 ? 'Time Up!' : formatTime(timeLeft ?? 0);
            // return 'Time Up';
        },
    },
    {
        header: 'Option',
    }
];

function formatTime(seconds: number) {
    // Hàm này sẽ định dạng thời gian theo định dạng mong muốn, ví dụ:
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}