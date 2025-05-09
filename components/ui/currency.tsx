"use client";
import { useState, useEffect } from "react";
import { SiEthereum } from "react-icons/si"; // dùng icon eth từ react-icons

interface CurrencyProps {
    value?: string | number;
}

const Currency: React.FC<CurrencyProps> = ({ value }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <div className="flex items-center gap-1 font-semibold">
            <SiEthereum className="text-blue-500" size={18} /> {/* Icon ETH */}
            {Number(value)?.toLocaleString('en-US', { maximumFractionDigits: 4 })} ETH
        </div>
    );
};

export default Currency;
