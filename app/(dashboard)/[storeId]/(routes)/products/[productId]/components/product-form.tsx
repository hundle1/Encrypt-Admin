"use client";

import * as z from "zod";
import { ChangeEvent, useState } from 'react'
import { createHash } from 'crypto';
import { Category, Creator, Image, Product, Type } from "@prisma/client";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash } from "lucide-react";
import { ControllerRenderProps, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { AlertModal } from '@/components/modals/alert-modal';
import ImageUpload from '@/components/ui/image-upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FaFolder, FaFolderOpen, FaFile } from 'react-icons/fa';

interface ProductFromProps {
    initialData: Product & {
        images: Image[],
    } | null;
    categories: Category[]
    creators: Creator[]
    types: Type[]
}


const formSchema = z.object({
    name: z.string().min(1),
    images: z.object({ url: z.string() }).array(),
    price: z.coerce.number().min(1),
    hashID: z.coerce.string().min(1),
    describe: z.string().min(1),
    categoryId: z.string().min(1),
    creatorId: z.string().min(1),
    typeId: z.string().min(1),
    isFeatured: z.boolean().default(false).optional(),
    isArchived: z.boolean().default(false).optional()

})

type ProductFormValues = z.infer<typeof formSchema>;

export const ProductForm: React.FC<ProductFromProps> = ({
    initialData,
    categories,
    creators,
    types
}) => {

    const params = useParams();
    const router = useRouter();
    const [file, setFile] = useState<File[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hashID, setHashID] = useState<string | null>(null);  // State để lưu hashID
    const [loadingHash, setLoadingHash] = useState(false);  // State để kiểm tra trạng thái nút Hash
    const title = initialData ? 'Edit product' : 'Create product'
    const description = initialData ? 'Edit a product' : 'Add a new product'
    const toastMessage = initialData ? 'Product updated.' : 'Product created.'
    const action = initialData ? 'Save changes' : 'Create'
    
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData ? {
            ...initialData,
            price: parseFloat(String(initialData?.price)),
        } : {
            name: '',
            images: [],
            price: 0,
            hashID: '',
            describe: '',
            categoryId: '',
            creatorId: '',
            typeId: '',
            isFeatured: false,
            isArchived: false,
        }
    });

    const onSubmit = async (data: ProductFormValues) => {
        try {
            setLoading(true);
            // Gửi sản phẩm lên API
            if (initialData) {
                await axios.patch(`/api/${params.storeId}/products/${params.productId}`, data);
            } else {
                await axios.post(`/api/${params.storeId}/products`, data);
            }

            router.refresh();
            router.push(`/${params.storeId}/products`);
            toast.success(toastMessage);
        } catch (err) {
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };



    const onDelete = async () => {
        try {
            setLoading(true);
            await axios.delete(`/api/${params.storeId}/products/${params.productId}`)
            router.refresh();
            router.push(`/${params.storeId}/products`)
            toast.success("Product deleted.")
        } catch (err) {
            toast.error("Something Went Wrong.");
        } finally {
            setLoading(false)
            setOpen(false);
        }
    }
    const handleFolderSelection = (event: React.ChangeEvent<HTMLInputElement>, field: ControllerRenderProps<ProductFormValues, "images">) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
    
        setFile(Array.from(files)); // Cập nhật danh sách file
    
        const folderStructure: { [key: string]: string[] } = {};
        const imagesArray: { url: string }[] = []; // Mảng hình ảnh để cập nhật field
    
        Array.from(files).forEach(file => {
            const relativePath = file.webkitRelativePath;
            const pathParts = relativePath.split('/');
            const folderPath = pathParts.slice(0, -1).join('/');
            const fileName = pathParts[pathParts.length - 1];
    
            if (!folderStructure[folderPath]) {
                folderStructure[folderPath] = [];
            }
            folderStructure[folderPath].push(fileName);
    
            // Đưa file vào danh sách ảnh
            imagesArray.push({ url: URL.createObjectURL(file) });
        });
    
        setFolderStructure(folderStructure);
        field.onChange(imagesArray); // Cập nhật đúng định dạng mảng [{ url: ... }]
    };
    
    
    const hashFolder = async (files: File[]) => {
        const hash = createHash('sha256');
    
        // Sắp xếp file theo tên để đảm bảo thứ tự hash nhất quán
        const sortedFiles = files.sort((a, b) => a.name.localeCompare(b.name));
    
        for (const file of sortedFiles) {
            const buffer = await file.arrayBuffer();
            hash.update(new Uint8Array(buffer));
        }
    
        return hash.digest('hex');
    };
    const uploadToPinata = async (files: File[]) => {
        const formData = new FormData();
    
        files.forEach(file => formData.append('file', file));
        formData.append('pinataMetadata', JSON.stringify({ name: "folder_upload" }));
        formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));
    
        try {
            const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer YOUR_PINATA_JWT`
                }
            });
    
            return response.data.IpfsHash;
        } catch (error: any) {
            console.error("Upload failed:", error.response?.data || error.message);
            toast.error("Upload failed. Check console for details.");
            return null;
        }
    };
        
    const [folderStructure, setFolderStructure] = useState<{ [key: string]: string[] }>({});
    const hashAndUploadFolder = async () => {
        if (!file.length) return;
        setLoadingHash(true);
    
        try {
            const folderHash = await hashFolder(file);
            setHashID(folderHash);
    
            const ipfsHash = await uploadToPinata(file);
            if (ipfsHash) {
                setHashID(ipfsHash);
            } else {
                toast.error("Failed to upload to Pinata.");
            }
        } catch (error) {
            toast.error("Error hashing/uploading folder.");
        } finally {
            setLoadingHash(false);
        }
    };
    
    return (
        <>
            <AlertModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={onDelete}
                loading={loading}
            />
            <div className="flex items-center justify-between">
                <Heading title={title} description={description} />
                {initialData && (
                    <Button variant="destructive" size="sm" onClick={() => setOpen(true)} disabled={loading}>
                        <Trash className="w-4 h-4" />
                    </Button>
                )}
            </div>
            <Separator />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
                <div>Choose a folder to upload</div>
                    <FormField
                        control={form.control}
                        name="images"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Choose a folder to upload</FormLabel>
                                <FormControl>
                                    <input type="file" ref={input => { if (input) input.webkitdirectory = true; }} multiple onChange={(event) => handleFolderSelection(event, field)} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button onClick={hashAndUploadFolder} disabled={loadingHash || hashID !== null}>
                        {loadingHash ? "Hashing..." : "Hash"}
                    </Button>
                    {hashID && (
                        <div className="mt-4">
                            <strong>Hash ID:</strong> {hashID}
                        </div>
                    )}                    
                    {/* Hiển thị các input khác chỉ khi đã hash thành công và có file */}
                    {file && hashID && (
                        <div className='grid grid-cols-3 gap-8'>
                            <FormField
                                control={form.control}
                                name="images"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>NFS Present Image</FormLabel>
                                        <FormControl>
                                            <ImageUpload
                                                value={Array.isArray(field.value) ? field.value.map((image) => image.url) : []}
                                                disabled={loading}
                                                onChange={(url) => field.onChange([...field.value, { url }])}
                                                onRemove={(url) => field.onChange([...field.value.filter((image) => image.url !== url)])}
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
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input disabled={loading} placeholder='Product Name' {...field} />
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
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input type="number" disabled={loading} placeholder='Product Price' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select
                                            disabled={loading}
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue
                                                        defaultValue={field.value}
                                                        placeholder='Select a Category'
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map(category => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        <FormField
                            control={form.control}
                            name="typeId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select
                                        disabled={loading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue
                                                    defaultValue={field.value}
                                                    placeholder='Select Type Of Product'
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {types.map(type => (
                                                <SelectItem key={type.id} value={type.id}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="creatorId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Creator</FormLabel>
                                    <Select
                                        disabled={loading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue
                                                    defaultValue={field.value}
                                                    placeholder='Select Creator Name'
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {creators.map(creator => (
                                                <SelectItem key={creator.id} value={creator.id}>
                                                    {creator.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="describe"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Discribes this product</FormLabel>
                                    <FormControl>
                                        <Input type='textarea' disabled={loading} placeholder='Product describe' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="isFeatured"
                            render={({ field }) => (
                                <FormItem className='flex flex-row items-start p-4 space-x-3 space-y-0 border rounded-md'>
                                    <FormControl>
                                        <Checkbox
                                            // @ts-ignore
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className='space-y-1 leading-none'>
                                        <FormLabel>
                                            Featured
                                        </FormLabel>
                                        <FormDescription>
                                            The product will appear on the home page.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="isArchived"
                            render={({ field }) => (
                                <FormItem className='flex flex-row items-start p-4 space-x-3 space-y-0 border rounded-md'>
                                    <FormControl>
                                        <Checkbox
                                            // @ts-ignore
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className='space-y-1 leading-none'>
                                        <FormLabel>
                                            Archived
                                        </FormLabel>
                                        <FormDescription>
                                            The product will appear anywhere in the store.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                    )}
                   
                    <Button disabled={loading} className='ml-auto' type='submit'>{action}</Button>
                </form>
            </Form>
            {/* <Separator /> */}
        </>
    )
}