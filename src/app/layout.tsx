// app/layout.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; // Ensure the path is correct
import SessionProviderWrapper from "@/components/ProviderComp/SessionProviderWrapper";
import ClientLayout from "@/components/ClientLayout";
import { Poppins } from "next/font/google";
import "./globals.css"; // Ensure global styles are imported
import UserMenu from "@/components/userComp/UserMenu";
import { Metadata } from "next";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StoreProviders from "@/components/ProviderComp/StoreProvider";
import React, { useMemo } from 'react';

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "e-commerce app",
  description: "Generated by create next app",
};


 const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  // Use useMemo to memoize the session
  const session = await useMemo(() => getServerSession(authOptions), []);

  return (
  
      <html lang="en">
        <body className={poppins.className}>
          <SessionProviderWrapper session={session} >
          <StoreProviders>
            <ClientLayout>
            <UserMenu session={session}/>
            <ToastContainer 
                position="top-center"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
              />
              {children}
            </ClientLayout>
            </StoreProviders>
          </SessionProviderWrapper>
        </body>
      </html>
    
  );
};

export default RootLayout;
