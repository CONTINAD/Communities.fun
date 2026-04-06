import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import TwitterProvider from "next-auth/providers/twitter";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

async function fetchTwitterExtras(accessToken: string) {
  try {
    const res = await fetch(
      "https://api.twitter.com/2/users/me?user.fields=description,profile_banner_url,profile_image_url,pinned_tweet_id&expansions=pinned_tweet_id&tweet.fields=text",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const user = json.data;
    const pinnedTweet = json.includes?.tweets?.[0]?.text || null;
    return {
      bio: user?.description || null,
      banner: user?.profile_banner_url || null,
      profileImage: user?.profile_image_url?.replace("_normal", "") || null,
      pinnedTweet,
      username: user?.username || null,
      name: user?.name || null,
    };
  } catch {
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID ?? "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET ?? "",
      version: "2.0",
      profile(profile) {
        const data = profile.data;
        return {
          id: data.id,
          name: data.name,
          email: null,
          image: data.profile_image_url?.replace("_normal", "") ?? null,
          username: data.username,
          description: data.description,
        };
      },
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
          image: user.avatar || user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "twitter" && user.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
          });
          if (!dbUser) return true;

          // Fetch extra profile data from Twitter API
          const extras = account.access_token
            ? await fetchTwitterExtras(account.access_token)
            : null;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const updateData: Record<string, any> = {};
          const xUser = user as unknown as Record<string, unknown>;

          // Set username from X handle if current username is auto-generated cuid
          const isDefaultUsername = /^c[a-z0-9]{24}$/.test(dbUser.username);
          if (isDefaultUsername) {
            const handle = extras?.username || (xUser.username as string);
            if (handle) {
              let username = handle;
              const existing = await prisma.user.findUnique({ where: { username } });
              if (existing && existing.id !== dbUser.id) {
                username = `${username}_${Date.now().toString(36).slice(-4)}`;
              }
              updateData.username = username;
            }
          }

          // Always sync from X on every sign-in
          const profileImage = extras?.profileImage || user.image;
          if (profileImage) {
            updateData.avatar = profileImage;
            updateData.image = profileImage;
          }

          if (extras?.name || user.name) {
            updateData.name = extras?.name || user.name;
          }

          // Bio from Twitter API (has full description)
          if (extras?.bio) {
            updateData.bio = extras.bio;
          } else if (xUser.description) {
            updateData.bio = xUser.description as string;
          }

          // Banner from Twitter API
          if (extras?.banner) {
            updateData.coverImage = extras.banner;
          }

          // Pinned tweet
          if (extras?.pinnedTweet) {
            updateData.pinnedTweet = extras.pinnedTweet;
          }

          if (Object.keys(updateData).length > 0) {
            await prisma.user.update({
              where: { id: user.id },
              data: updateData,
            });
          }
        } catch (e) {
          console.error("Error updating user from Twitter:", e);
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { username: true },
        });
        token.username = dbUser?.username || (user as unknown as Record<string, string>).username;
      }
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
};
