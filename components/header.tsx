import React from 'react'
import { UserButton, auth } from '@clerk/nextjs';
import { MainNav } from '@/components/main-nav';
import StoreSwitcher from '@/components/store-switcher';
import { redirect } from 'next/navigation'
import prismadb from '@/lib/prismadb';
import { ThemeToggle } from '@/components/theme-toggle';
import { PrismaClient } from '@prisma/client';
import { Button } from './ui/button';
import { Settings, WalletMinimal } from 'lucide-react';
import toast from 'react-hot-toast';


export const Header = async () => {
    const { userId } = auth() as { userId: string};
    const prisma = new PrismaClient();
    const posts = await prisma.store.findMany();

    // const handleCopy = (text: string) => {
    //   navigator.clipboard.writeText(text)
    //   .then(() => {
    //     toast.success('Copied to clipboard')
    //   })
    
    // }

    if(!userId) {
      redirect("/sign-in")
    }
  
    const stores = await prismadb?.store.findMany({
      where: {
        userId,
      }
    })

  return (
    <div className='flex w-full flex-row border-b'>
      <div className='p-6 w-4/12'>Stack Market Admin</div>
      <div className='flex w-8/12 pt-4 pr-8 space-x-3 items-center  pb-4'>
          <div className='flex items-center ml-auto space-x-4'>
            {posts.map((post) => (
              <Button key={post.id} className='flex items-center px-4 py-2 bg-neutral-400 rounded-xl w-[150px]'>
                <WalletMinimal size={20} color='white' />
                  <span className='ml-2 text-sm font-medium text-white w-[100px] truncate ...'>
                      {post.walletAddress}
                  </span>
                  </Button>
              ))}
          </div>
          <ThemeToggle />
          <UserButton afterSignOutUrl='/' />
      </div>
    </div>
  )
}