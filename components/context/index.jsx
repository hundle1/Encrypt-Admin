"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { useAddress, useMetamask, useSigner } from "@thirdweb-dev/react";
import { ethers } from "ethers";

// Khởi tạo Context
const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const address = useAddress();
  const connect = useMetamask();
  const signer = useSigner();

  const [sdk, setSdk] = useState(null);
  const contractAddress = "0xAD62BA0614d9e2a6ECAcAf92889d5e190749c290";
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (sdk) {
      const loadContract = async () => {
        try {
          const contractInstance = await sdk.getContract(contractAddress);
          setContract(contractInstance);
        } catch (error) {
          console.error("Lỗi khi tải contract:", error);
        }
      };
      loadContract();
    }
  }, [sdk]);
  console.log("Contract instance:", contract);

  useEffect(() => {
    if (signer) {
      setSdk(ThirdwebSDK.fromSigner(signer, "sepolia"));
    }
  }, [signer]);
  useEffect(() => {
    console.log("Signer:", signer);
  }, [signer]);
  const createProduct = async (
    productId,
    name,
    price,
    describe,
    IPFShash,
    images,
    typeId
  ) => {
    if (!contract) {
      console.error("Contract chưa được khởi tạo");
      return;
    }
  
    try {
      const tx = await contract.call("createProduct", [
        productId,
        name,
        price,
        describe,
        IPFShash,
        images,
        typeId,
      ]);
  
      console.log("Giao dịch tạo sản phẩm thành công:", tx);
      return tx;
    } catch (error) {
      console.error("Lỗi khi tạo sản phẩm:", error);
      throw error;
    }
  };
  

  return (
    <StateContext.Provider
      value={{
        address,
        connect,
        sdk,
        contract,
        signer,
        createProduct
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
