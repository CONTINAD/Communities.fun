import { User, Community, Post, Like, CommunityMember } from "@prisma/client";

export type PostWithDetails = Post & {
  author: Pick<User, "id" | "name" | "username" | "avatar" | "image">;
  community: Pick<Community, "id" | "name" | "slug">;
  _count: {
    likes: number;
    replies: number;
    reposts: number;
  };
  likes: Pick<Like, "userId">[];
  repostOf?: (Post & {
    author: Pick<User, "id" | "name" | "username" | "avatar" | "image">;
  }) | null;
};

export type CommunityWithDetails = Community & {
  _count: {
    members: number;
    posts: number;
  };
  creator: Pick<User, "id" | "name" | "username" | "avatar" | "image">;
};

export type MemberWithUser = CommunityMember & {
  user: Pick<User, "id" | "name" | "username" | "avatar" | "image" | "bio">;
};
