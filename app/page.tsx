import HomePageClient from "@/sections/home-page/HomePageClient";
import Header from "@/sections/shared/Header";
import SessionProvider from "@/sections/shared/SessionProvider";

export default function Page() {
  return (
    <SessionProvider>
      <Header />
      <HomePageClient />
    </SessionProvider>
  );
}