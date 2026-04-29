import type { ReactNode } from "react";

// Auth pages don't use the main Navbar/Footer layout
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
