import React from 'react'
import { UserButton, auth } from '@clerk/nextjs';
import { MainNav } from '@/components/main-nav';
import StoreSwitcher from '@/components/store-switcher';
import { redirect } from 'next/navigation'
import prismadb from '@/lib/prismadb';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from './ui/button';
import { WalletMinimal } from 'lucide-react';
import { PrismaClient } from '@prisma/client';


const Navbar = async () => {
  const { userId } = auth() as { userId: string};
  const prisma = new PrismaClient();
  const posts = await prisma.store.findMany();


  if(!userId) {
    redirect("/sign-in")
  }

  const stores = await prismadb?.store.findMany({
    where: {
      userId,
    }
  })

  return (
    <div className='border-b'>
      <div className='flex items-center h-16 px-4'>
        <StoreSwitcher items={stores} />
        <MainNav className='mx-6' />
        <div className='flex items-center ml-auto space-x-4'>
          {posts.map((post) => (
            <Button key={post.id} className='flex items-center px-4 py-2 bg-neutral-400 rounded-xl'>
              <WalletMinimal size={20} color='white' />
              <span className='ml-2 text-sm font-medium text-white'>
                {post.walletAddress}
              </span>
            </Button>
          ))}
          <ThemeToggle />
          <UserButton afterSignOutUrl='/' />
        </div>
      </div>
    </div>
  )
}

export default Navbar
function useClerkUser(): { user: any; } {
  throw new Error('Function not implemented.');
}

