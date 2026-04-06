import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import TwitterProvider from "next-auth/providers/twitter";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID ?? "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET ?? "",
      version: "2.0",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          image: user.avatar,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // For OAuth sign-ins, ensure user has a username
      if (account?.provider === "twitter" && user.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        // Check if username is the auto-generated cuid default (needs real username)
        const needsUsername = dbUser && (!dbUser.username || dbUser.username.length === 25);
        if (needsUsername) {
          // Pull username from Twitter profile
          const twitterUsername =
            (profile as Record<string, unknown>)?.data
              ? ((profile as Record<string, unknown>).data as Record<string, string>)?.username
              : (profile as Record<string, string>)?.screen_name;

          let username = twitterUsername || `user_${user.id.slice(0, 8)}`;

          // Make sure username is unique
          const existing = await prisma.user.findUnique({ where: { username } });
          if (existing && existing.id !== dbUser.id) {
            username = `${username}_${Date.now().toString(36).slice(-4)}`;
          }

          // Update user with Twitter profile data
          await prisma.user.update({
            where: { id: user.id },
            data: {
              username,
              name: user.name || username,
              avatar: user.image?.replace("_normal", "") || undefined,
              bio: (profile as Record<string, unknown>)?.description as string || undefined,
            },
          });
        } else if (dbUser) {
          // Existing user — update avatar from X if they don't have one
          if (!dbUser.avatar && user.image) {
            await prisma.user.update({
              where: { id: user.id },
              data: { avatar: user.image?.replace("_normal", "") },
            });
          }
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        // Fetch username from DB since OAuth user object doesn't have it
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { username: true },
        });
        token.username = dbUser?.username || (user as unknown as Record<string, string>).username;
      }
      // Handle session updates (e.g. after linking)
      if (trigger === "update" && session) {
        token.username = (session as Record<string, string>).username || token.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.id;
        (session.user as Record<string, unknown>).username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  events: {
    async createUser({ user }) {
      // When a new user is created via OAuth, ensure they have a username
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (dbUser && !dbUser.username) {
        const baseUsername = user.name?.toLowerCase().replace(/[^a-z0-9_]/g, "") || "user";
        let username = baseUsername || `user_${user.id.slice(0, 8)}`;
        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) {
          username = `${username}_${Date.now().toString(36).slice(-4)}`;
        }
        await prisma.user.update({
          where: { id: user.id },
          data: { username },
        });
      }
    },
  },
};
