"use client";
import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { AreaChart, Bolt, Rocket, CopyPlus, FolderKanban, PackageSearch, Presentation, ShieldCheck, SquareDashedBottomCode, FolderLock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";

const NavLink = React.memo(({ href, label, active }: { href: string; label: React.ReactNode; active?: boolean }) => {
    return (
        <Link
            href={href}
            className={cn(
                "text-sm font-medium hover:text-primary transition transform duration-300",
                active ? "text-white dark:text-white scale-125 ml-2 bg-[#1c1c24] p-2 rounded-lg" : "text-muted-foreground"
            )}
        >
            {label}
        </Link>
    );
});

function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
    const pathname = usePathname();
    const params = useParams();
    const storeId = params.storeId;

    const revenueRoutes = useMemo(() => [
        {
            href: `/${storeId}`,
            label: <div className="flex ml-5"><AreaChart size={20} className="text-[#1dc071]" /> &nbsp; Overview</div>,
            active: pathname === `/${storeId}`,
        },
        {
            href: `/${storeId}/orders`,
            label: <div className="flex ml-5"><PackageSearch size={20} className="text-[#1dc071]" /> &nbsp; Oder Status</div>,
            active: pathname === `/${storeId}/orders`,
        },
        {
            href: `http://localhost:5173/`,
            label: <div className="flex ml-5"><Rocket size={20} className="text-[#1dc071]" /> &nbsp; Fundrasing</div>,
        },
    ], [storeId, pathname]);

    const productRoutes = useMemo(() => [
        {
            href: `/${storeId}/billboards`,
            label: <div className="flex ml-5"><Presentation size={20} className="text-[#1dc071]" /> &nbsp; Billboard</div>,
            active: pathname === `/${storeId}/billboards`,
        },
        {
            href: `/${storeId}/categories`,
            label: <div className="flex ml-5"><CopyPlus size={20} className="text-[#1dc071]" /> &nbsp; Categories</div>,
            active: pathname === `/${storeId}/categories`,
        },
        {
            href: `/${storeId}/types`,
            label: <div className="flex ml-5"><SquareDashedBottomCode size={20} className="text-[#1dc071]" /> &nbsp; Type</div>,
            active: pathname === `/${storeId}/types`,
        },
        {
            href: `/${storeId}/creators`,
            label: <div className="flex ml-5"><ShieldCheck size={20} className="text-[#1dc071]" /> &nbsp; Creator</div>,
            active: pathname === `/${storeId}/creators`,
        },
        {
            href: `/${storeId}/products`,
            label: <div className="flex ml-5"><FolderKanban size={20} className="text-[#1dc071]" /> &nbsp; Products</div>,
            active: pathname === `/${storeId}/products`,
        },
        {
            href: `/${storeId}/minting`,
            label: <div className="flex ml-5">
                <FolderLock size={20} className="text-[#1dc071]" /> &nbsp; Upload NFS <Sparkles size={15} className="text-[#ff0505]" />
            </div>,
            active: pathname === `/${storeId}/minting`,
        },
    ], [storeId, pathname]);

    const settingsRoutes = useMemo(() => [
        {
            href: `/${storeId}/settings`,
            label: <div className="flex ml-5"><Bolt size={20} className="text-[#1dc071]" /> &nbsp; Setting</div>,
            active: pathname === `/${storeId}/settings`,
        },
    ], [storeId, pathname]);

    return (
        <nav className={cn("flex self-start p-4 pt-8 space-y-6 mx-0", className)}>
            <Link href="http://localhost:3001/" className="w-full">
                <Button className={cn("text-sm font-medium hover:font-bold transition duration-300 w-full")}>
                    Go to Store
                </Button>
            </Link>
            <Separator className="pr-44" />
            <h2>Revenue</h2>
            {revenueRoutes.map((route, index) => (
                <NavLink key={index} href={route.href} label={route.label} active={route.active} />
            ))}
            <Separator className="pr-44" />
            <h3>Product</h3>
            {productRoutes.map((route, index) => (
                <NavLink key={index} href={route.href} label={route.label} active={route.active} />
            ))}
            <Separator className="pr-44" />
            <h3>Settings</h3>
            {settingsRoutes.map((route, index) => (
                <NavLink key={index} href={route.href} label={route.label} active={route.active} />
            ))}
        </nav>
    );
}

export default React.memo(MainNav);
