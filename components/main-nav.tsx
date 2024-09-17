"use client";
import { cn } from "@/lib/utils"
import { AreaChart, Bolt, CopyPlus, FolderKanban, PackageSearch, Presentation, ShieldCheck, SquareDashedBottomCode } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
    const pathname = usePathname();
    const params = useParams();
    //reveneu
    const routesReveneus = [{
        href: `/${params.storeId}`,
        label: <div className="flex ml-5"><AreaChart size={20} /> &nbsp; Overview</div>,
        active: pathname === `/${params.storeId}`
    },
    {
        href: `/${params.storeId}/orders`,
        label: <div className="flex ml-5"><PackageSearch size={20} /> &nbsp; Oder Status</div>,
        active: pathname === `/${params.storeId}/orders`
    }];

    // product
    const routesProducts = [{
        href: `/${params.storeId}/billboards`,
        label: <div className="flex ml-5"><Presentation size={20} /> &nbsp; Billboard</div>,
        active: pathname === `/${params.storeId}/billboards`
    }, {
        href: `/${params.storeId}/categories`,
        label: <div className="flex ml-5"><CopyPlus size={20} /> &nbsp; Categories</div>,
        active: pathname === `/${params.storeId}/categories`
    }, {
        href: `/${params.storeId}/types`,
        label: <div className="flex ml-5"><SquareDashedBottomCode size={20} /> &nbsp; Type</div>,
        active: pathname === `/${params.storeId}/types`
    }, {
        href: `/${params.storeId}/creators`,
        label: <div className="flex ml-5"><ShieldCheck size={20} /> &nbsp; Creator</div>,
        active: pathname === `/${params.storeId}/creators`
    }, {
        href: `/${params.storeId}/products`,
        label: <div className="flex ml-5"><FolderKanban size={20} /> &nbsp; Mint Product</div>,
        active: pathname === `/${params.storeId}/products`
    }];

    const routesSettings = [{
        href: `/${params.storeId}/settings`,
        label: <div className="flex ml-5"><Bolt size={20} /> &nbsp; Setting</div>,
        active: pathname === `/${params.storeId}/settings`
    }];
    return (
        <nav className={cn("flex  self-start p-4 pt-8 space-y-8 mx-0", className)}>
            <Link href="http://localhost:3001/" className="w-full">
                <Button className={cn("text-sm font-medium hover:font-bold transition duration-300 w-full")}>
                    Go to Store
                </Button>
            </Link>
            <Separator className="pr-44" />
            <h2>Reveneu</h2>
            {routesReveneus.map((routesReveneu, index) => (
                <Link key={index} href={routesReveneu.href} className={cn("text-sm font-medium  hover:text-primary  hover:scale-125 transition duration-300", routesReveneu.active ? "text-black dark:text-white" : "text-muted-foreground")}>
                    {routesReveneu.label}
                </Link>
            ))}
            <Separator className="pr-44" />
            <h3>Product</h3>
            {routesProducts.map((routesProduct, index) => (
                <Link key={index} href={routesProduct.href} className={cn("text-sm font-medium  hover:text-primary  hover:scale-125 transition duration-300 ", routesProduct.active ? "text-black dark:text-white" : "text-muted-foreground")}>
                    {routesProduct.label}
                </Link>
            ))}
            <Separator className="pr-44" />
            <h3>Settings</h3>
            {routesSettings.map((routesSetting, index) => (
                <Link key={index} href={routesSetting.href} className={cn("text-sm font-medium  hover:text-primary  hover:scale-125 transition duration-300 ", routesSetting.active ? "text-black dark:text-white" : "text-muted-foreground")}>
                    {routesSetting.label}
                </Link>
            ))}
        </nav>
    )
}