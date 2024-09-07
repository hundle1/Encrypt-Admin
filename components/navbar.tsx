import React from 'react'
import { auth } from '@clerk/nextjs';
import { MainNav } from '@/components/main-nav';
import StoreSwitcher from '@/components/store-switcher';
import { redirect } from 'next/navigation'
import prismadb from '@/lib/prismadb';
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
    <div className='w-[17%] h-full'>
      <div className='flex flex-col items-center h-24 p-4 pt-4'>
        <StoreSwitcher items={stores} className='p-4'/>
        <MainNav className='mx-0 flex flex-col' />
      </div>
    </div>
  )
}

export default Navbar
function useClerkUser(): { user: any; } {
  throw new Error('Function not implemented.');
}

