"use client";

import { useState } from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { useStateContext } from '@/components/context'; // Điều chỉnh đường dẫn cho phù hợp

// Định nghĩa schema với đầy đủ các trường cần thiết
const formSchema = z.object({
    id: z.string().min(1, "Phải chọn sản phẩm"),
    name: z.string().min(1, "Nhập tên sản phẩm"),
    describe: z.string().min(1, "Nhập mô tả"),
    price: z.string().min(1, "Nhập giá tiền"),
    IPFShash: z.string().min(1, "Nhập IPFS hash"),
    typeId: z.string().min(1, "Nhập loại sản phẩm")
});

type MintingFormValues = z.infer<typeof formSchema>;

interface MintingFormProps {
    products: any[]; // Bạn có thể định nghĩa kiểu cụ thể hơn nếu có
}

export const MintingForm: React.FC<MintingFormProps> = ({ products }) => {
    const params = useParams();
    const router = useRouter();
    const { contract, signer, connect } = useStateContext();
    const [loading, setLoading] = useState(false);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const form = useForm<MintingFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: '',
            name: '',
            describe: '',
            price: '',
            IPFShash: '',
            typeId: ''
        }
    });

    const onSubmit = async (data: MintingFormValues) => {
        try {
            if (!contract) {
                toast.error("Contract is not loaded");
                return;
            }
            
            if (!signer) {
                await connect(); // Yêu cầu kết nối ví nếu chưa có signer
                if (!signer) {
                    toast.error("Failed to connect wallet. Please try again.");
                    return;
                }
            }
    
            setLoading(true);
    
            const tx = await contract.call("createProduct", [
                data.id,
                data.name,
                data.price,
                data.describe,
                data.IPFShash,
                selectedProduct ? [selectedProduct.images[0].url] : [""],
                data.typeId
            ]);
    
            console.log("Transaction: ", tx);
            toast.success("NFT minted successfully");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Có lỗi xảy ra khi mint NFT");
        } finally {
            setLoading(false);
        }
    };
    

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex justify-center items-center h-[680px] w-full">
            {!isSelecting ? (
                <Button
                    onClick={async () => {
                        if (!signer) {
                            await connect(); // Kết nối ví nếu chưa kết nối
                        }
                        setIsSelecting(true);
                    }}
                    className="text-xl px-6 py-3"
                >
                    Choose a Product To Mint
                </Button>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-lg w-full h-full flex flex-col overflow-hidden">
                    {selectedProduct ? (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex space-x-8 w-full">
                                <div className="flex flex-col items-center w-1/3 bg-gray-100 p-4 rounded-lg shadow-md">
                                    <Image
                                        src={selectedProduct.images.length > 0 ? selectedProduct.images[0].url : '/placeholder.png'}
                                        alt={selectedProduct.name}
                                        width={300}
                                        height={300}
                                        className="rounded-md object-cover border border-gray-300"
                                    />
                                    <h2 className="text-xl font-bold mt-4 text-gray-900">{selectedProduct.name}</h2>
                                    <div className="bg-white p-3 rounded-lg w-full mt-2 shadow-sm">
                                        <p className="text-md text-gray-600">
                                            <span className="font-medium text-gray-800">Owner:</span> {selectedProduct.creator.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            <span className="font-medium text-gray-700">Created:</span> {format(new Date(selectedProduct.createdAt), 'dd/MM/yyyy')}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">
                                            <span className="font-medium text-gray-700">IPFS Hash:</span> {selectedProduct.hashID}
                                        </p>
                                    </div>
                                </div>
                                <div className="w-2/3 space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Product ID</FormLabel>
                                                <FormControl>
                                                    <input
                                                        {...field}
                                                        className="w-full p-2 border rounded-md"
                                                        defaultValue={selectedProduct.id || ''}
                                                        onChange={(e) => field.onChange(e.target.value)}
                                                        readOnly
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Product Name</FormLabel>
                                                <FormControl>
                                                    <input
                                                        {...field}
                                                        className="w-full p-2 border rounded-md"
                                                        defaultValue={selectedProduct.name || ''}
                                                        onChange={(e) => field.onChange(e.target.value)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="describe"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <input
                                                        {...field}
                                                        className="w-full p-2 border rounded-md"
                                                        defaultValue={selectedProduct.describe || ''}
                                                        onChange={(e) => field.onChange(e.target.value)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Price (decimal, ex: 1)</FormLabel>
                                                <FormControl>
                                                    <input
                                                        type="number"
                                                        {...field}
                                                        className="w-full p-2 border rounded-md"
                                                        defaultValue={selectedProduct.price || ''}
                                                        onChange={(e) => field.onChange(e.target.value)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="IPFShash"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>IPFS Hash</FormLabel>
                                                <FormControl>
                                                    <input
                                                        {...field}
                                                        className="w-full p-2 border rounded-md"
                                                        defaultValue={selectedProduct.hashID || ''}
                                                        onChange={(e) => field.onChange(e.target.value)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="typeId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type ID</FormLabel>
                                                <FormControl>
                                                    <input
                                                        {...field}
                                                        className="w-full p-2 border rounded-md"
                                                        defaultValue={selectedProduct.typeId || ''}
                                                        onChange={(e) => field.onChange(e.target.value)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button disabled={loading} className="w-full" type="submit">
                                        Mint NFT
                                    </Button>
                                    <Button variant="outline" onClick={() => setSelectedProduct(null)} className="w-full">
                                        Chọn sản phẩm khác
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    ) : (
                        <div className="w-full flex-1 flex flex-col overflow-hidden">
                            {/* Tìm kiếm */}
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm sản phẩm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                            {/* Danh sách sản phẩm */}
                            <div className="grid gap-4 flex-1 overflow-y-auto w-full">
                                {filteredProducts.map((product) => (
                                    <button
                                        key={product.id}
                                        onClick={() => {
                                            setSelectedProduct(product);
                                            // Đưa các giá trị mặc định vào form dựa trên sản phẩm được chọn
                                            form.setValue("id", product.id || "");
                                            form.setValue("name", product.name || "");
                                            form.setValue("describe", product.describe || "");
                                            form.setValue("price", product.price?.toString() || "");
                                            form.setValue("IPFShash", product.hashID || "");
                                            form.setValue("typeId", product.typeId || "");
                                        }}
                                        className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-100 w-full"
                                    >
                                        <div>
                                            <Image
                                                src={product.images.length > 0 ? product.images[0].url : '/placeholder.png'}
                                                alt={product.name}
                                                width={150}
                                                height={150}
                                                className="rounded-md object-cover h-24 w-40"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{product.name}</p>
                                            <p className="text-sm text-gray-500">Owner: {product.creator.name}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
