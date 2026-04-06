import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth({
  ...authOptions,
  debug: process.env.NEXTAUTH_DEBUG === "true",
});

export { handler as GET, handler as POST };
