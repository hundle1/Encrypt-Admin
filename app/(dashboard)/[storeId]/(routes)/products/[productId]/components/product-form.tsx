"use client";

import * as z from "zod";
import JSZip from "jszip";
import { ChangeEvent, useState } from 'react'
import { createHash } from 'crypto';
import { Category, Creator, Image, Product, Type } from "@prisma/client";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Folder, Check, File as FileIcon } from "lucide-react";
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
    const [folderName, setFolderName] = useState<string | null>(null);
    const handleFolderSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setFile(Array.from(files));

        const folderPath = files[0].webkitRelativePath.split('/')[0];
        setFolderName(folderPath);

        const structure: { [key: string]: string[] } = {};
        Array.from(files).forEach(file => {
            const relativePath = file.webkitRelativePath;
            const pathParts = relativePath.split('/');
            const folder = pathParts.slice(0, -1).join('/');
            const fileName = pathParts[pathParts.length - 1];

            if (!structure[folder]) {
                structure[folder] = [];
            }
            structure[folder].push(fileName);
        });
        setFolderStructure(structure);
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

    const zipFolder = async (files: File[]) => {
        const zip = new JSZip();

        files.forEach((file) => {
            zip.file(file.webkitRelativePath || file.name, file);
        });

        const zipBlob = await zip.generateAsync({ type: "blob" });
        return new File([zipBlob], "folder_upload.zip", { type: "application/zip" });
    };

    const uploadFolderToPinata = async (files: File[]) => {
        try {
            const zipFile = await zipFolder(files);
            const formData = new FormData();
            formData.append("file", zipFile);
            toast.success("File Zip successfully");
            const response = await axios.post(`/api/upload-folder`, formData);
            console.log("Upload response:", response.data);
            return response.data.ipfsHash;
        } catch (error) {
            console.error("Upload error:", error);
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
            const ipfsHash = await uploadFolderToPinata(file);
            if (ipfsHash) {
                setHashID(ipfsHash);
                toast.success("Hashed and uploaded folder successfully.");
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
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8 ">
                    <FormItem>
                        <FormLabel>Choose a folder to upload</FormLabel>
                        {/* <FormControl>
                            <div className="relative flex flex-col items-center justify-center w-1/2 h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                    ref={(input) => {
                                        if (input) input.webkitdirectory = true;
                                    }}
                                    multiple
                                    onChange={(event) => handleFolderSelection(event)}

                                />
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <div className="flex gap-2 text-gray-500">
                                        Input include:
                                        <Folder className="w-6 h-6 text-gray-500" /> /
                                        <FileIcon className="w-6 h-6 text-gray-500" />
                                    </div>
                                    <Plus className="w-6 h-6 text-gray-400" />
                                    <p className="text-sm text-gray-500">Click to upload</p>
                                </div>
                            </div>
                        </FormControl> */}
                        {!file.length ? (
                            <div className="relative flex flex-col items-center justify-center w-1/2 h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                    ref={(input) => {
                                        if (input) input.webkitdirectory = true;
                                    }}
                                    multiple
                                    onChange={handleFolderSelection}
                                />
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <Folder className="w-6 h-6 text-gray-500" />
                                    <p className="text-sm text-gray-500">Click to upload folder</p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-white shadow-lg rounded-xl w-2/3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Folder className="w-6 h-6 text-blue-500" />
                                        <span className="font-semibold text-lg">{folderName}</span>
                                    </div>
                                    <span className="text-gray-500">{file.length} files</span>
                                </div>
                                <ul className="mt-4 max-h-60 overflow-y-auto border-t pt-2">
                                    {file.map((f, index) => (
                                        <li key={index} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg">
                                            <FileIcon className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-700">{f.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <FormMessage />
                    </FormItem>

                    <Button className="m-4" onClick={hashAndUploadFolder} disabled={loadingHash || hashID !== null}>
                        {loadingHash ? "Hashing..." : "Hash"}
                    </Button>
                    {hashID && (
                        <>
                            <FormField
                                control={form.control}
                                name="hashID"
                                render={({ field }) => (
                                    <div className="mt-4">
                                        <strong >Hash String:</strong> {hashID}
                                    </div>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="hashID"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>IPFS hash ID:</FormLabel>
                                        <FormControl>
                                            <Input disabled={loading} placeholder='Product Name' {...field} value={hashID} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}
                    {/* Hiển thị các input khác chỉ khi đã hash thành công và có file */}
                    {file && hashID && (
                        <div className='grid grid-cols-1 gap-8'>
                            <div>
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
                            </div>
                            <div className="grid grid-cols-3 gap-8">
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
                        </div>
                    )}
                    <Button disabled={loading} className='ml-auto' type='submit'>{action}</Button>
                </form>
            </Form>
            {/* <Separator /> */}
        </>
    )
}