"use client"

import Img from 'next/image';
import { Expand, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import usePreviewModal from "@/hooks/use-preview-modal";
import { MouseEventHandler } from 'react';
import IconButton from "./icon-button";
import Currency from "./currency";
import { Category, Creator, Image, Product, Type, File } from "@prisma/client";

interface ProductCard {
    data: Product & {
        images: Image[],
        files: File[]
    } | null;
    categories: Category[]
    creators: Creator[]
    types: Type[]
}
const ProductCard: React.FC<ProductCard> = ({ data }) => {
    const previewModal = usePreviewModal();
    const router = useRouter();
    const handleClick = () => {
        router.push(`/product/${data?.id}`)
    }

    const onPreview: MouseEventHandler<HTMLButtonElement> = (event) => {
        event.stopPropagation();
        if (data) {
            previewModal.onOpen(data);
        }
    }

    const onAddToCart: MouseEventHandler<HTMLButtonElement> = (event) => {
        event.stopPropagation();
    }

    return ( 
        <div onClick={handleClick} className="p-3 space-y-4 bg-white border cursor-pointer group rounded-xl">
            {/* Images and Actions */}
            <div className="relative bg-gray-100 aspect-square rounded-xl">
            <Img
                fill
                src={data?.images?.[0]?.url ?? ''}
                alt="Images"
                className="object-cover rounded-md aspect-square" />
                <div className="absolute w-full px-6 transition opacity-0 group-hover:opacity-100 bottom-5">
                    <div className="flex justify-center gap-x-6">
                        <IconButton
                            onClick={onPreview}
                            icon={<Expand size={20} className="text-gray-600" />}/>
                        <IconButton
                            onClick={onAddToCart}
                            icon={<ShoppingCart size={20} className="text-gray-600" />}/>
                    </div>
                </div>
            </div>
            {/* Description */}
            <div>
                <p className="text-lg font-semibold">
                    {data?.name}
                </p>
                <p className="text-sm text-gray-500">
                    {data?.categoryId}
                </p>
            </div>
            {/* Price */}
            <div className="flex items-center justify-between">
                <Currency value={data?.price.toString()} />
            </div>
        </div>
    );
}

export default ProductCard;