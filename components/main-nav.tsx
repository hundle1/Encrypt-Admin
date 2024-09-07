"use client";
import { cn } from "@/lib/utils"
import { AreaChart, Bolt, CopyPlus, FolderKanban, PackageSearch, Presentation, ShieldCheck, SquareDashedBottomCode } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export function MainNav({ className, ...props } : React.HTMLAttributes<HTMLElement>) {
    const pathname = usePathname();
    const params = useParams();

    const routes = [{
        href: `/${params.storeId}`,
        label: <div className="flex"><AreaChart size={20} /> &nbsp; Overview</div>,
        active: pathname === `/${params.storeId}`
    }, {
        href: `/${params.storeId}/billboards`,
        label: <div className="flex"><Presentation size={20}/> &nbsp; Billboard</div>,
        active: pathname === `/${params.storeId}/billboards`
    }, {
        href: `/${params.storeId}/categories`,
        label: <div className="flex"><CopyPlus size={20}/> &nbsp; Categories</div>,
        active: pathname === `/${params.storeId}/categories`
    }, {
        href: `/${params.storeId}/types`,
        label: <div className="flex"><SquareDashedBottomCode size={20}/> &nbsp; Type</div>,
        active: pathname === `/${params.storeId}/types`
    }, {
        href: `/${params.storeId}/creators`,
        label: <div className="flex"><ShieldCheck size={20}/> &nbsp; Creator</div>,
        active: pathname === `/${params.storeId}/creators`
    }, {
        href: `/${params.storeId}/products`,
        label: <div className="flex"><FolderKanban size={20}/> &nbsp; Product</div>,
        active: pathname === `/${params.storeId}/products`
    }, {
        href: `/${params.storeId}/orders`,
        label: <div className="flex"><PackageSearch size={20}/> &nbsp; Oder Status</div>,
        active: pathname === `/${params.storeId}/orders`
    }, {
        href: `/${params.storeId}/settings`,
        label: <div className="flex"><Bolt size={20}/> &nbsp; Setting</div>,
        active: pathname === `/${params.storeId}/settings`
    }];
    return (
        <nav className={cn("flex  self-start p-4 pt-8 space-y-8 mx-0", className)}>
           {routes.map((route, index) => (
            <Link key={index} href={route.href} className={cn("text-sm font-medium  hover:text-primary  hover:scale-125 transition duration-300 ease-in-out", route.active ? "text-black dark:text-white" : "text-muted-foreground")}>
                {route.label}
            </Link>
           ))} 
        </nav>
    )
}