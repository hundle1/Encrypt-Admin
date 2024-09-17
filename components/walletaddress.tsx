"use client";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";

function WalletAddress() {
  const { user } = useUser();
  const onCopy = (description: string) => {
    navigator.clipboard.writeText(description);
    toast.success("Copy successfully");
  };
  // Nếu người dùng đã đăng nhập
  if (user) {
    const web3WalletAddress = user.web3Wallets?.toString();
    // Sử dụng web3WalletAddress để hiển thị
    return (
      <div onClick={() => onCopy(web3WalletAddress)}>
        {<p className="truncate">{web3WalletAddress}</p>}
      </div>
    );
  }
}

export default WalletAddress;
