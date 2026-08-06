import type { ReactNode } from "react";

// The page itself is a client component and so can't export metadata. A route layout
// can, and it's the smallest place to put it — /login was the one route inheriting the
// site-wide title.
export const metadata = {
  title: "Sign In — Maritime Angler",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
