"use client";
import { ThirdwebProvider, metamaskWallet, ChainId } from "@thirdweb-dev/react";
import { ToasterProvider } from "@/providers/toast-provider";
import { ModalProvider } from "@/providers/modal-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { StateContextProvider } from "@/components/context";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThirdwebProvider
            activeChain={ChainId.Sepolia}
            clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
            supportedWallets={[metamaskWallet()]}
        >
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
                <ToasterProvider />
                <ModalProvider />
                <StateContextProvider>
                    {children}
                </StateContextProvider>
            </ThemeProvider>
        </ThirdwebProvider>
    );
}
