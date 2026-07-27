"use client";

import { Box } from "@chakra-ui/react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

const BRAND_LIGHT = "#FDF8F5";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box minH="100vh" bg={BRAND_LIGHT}>
      <Sidebar />
      <Header />
      <Box ml="64" p="8">
        {children}
      </Box>
    </Box>
  );
}
