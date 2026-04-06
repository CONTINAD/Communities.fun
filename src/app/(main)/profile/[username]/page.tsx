import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import ProfileHeader from "@/components/profile/ProfileHeader";
import InfiniteFeed from "@/components/post/InfiniteFeed";
import { PostWithDetails } from "@/types";

interface ProfilePageProps {
  params: { username: string };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const profileUser = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      avatar: true,
      image: true,
      coverImage: true,
      pinnedTweet: true,
      createdAt: true,
    },
  });

  if (!profileUser) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const isOwnProfile = currentUser?.id === profileUser.id;

  const [postCount, communityCount, followerCount, followingCount, existingFollow] = await Promise.all([
    prisma.post.count({ where: { authorId: profileUser.id, parentId: null } }),
    prisma.communityMember.count({ where: { userId: profileUser.id } }),
    prisma.follow.count({ where: { followingId: profileUser.id } }),
    prisma.follow.count({ where: { followerId: profileUser.id } }),
    currentUser
      ? prisma.follow.findUnique({
          where: { followerId_followingId: { followerId: currentUser.id, followingId: profileUser.id } },
        })
      : null,
  ]);

  const isFollowing = !!existingFollow;

  const posts = await prisma.post.findMany({
    where: { authorId: profileUser.id, parentId: null },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { id: true, name: true, username: true, avatar: true, image: true },
      },
      community: {
        select: { id: true, name: true, slug: true },
      },
      _count: {
        select: { likes: true, replies: true, reposts: true },
      },
      likes: {
        where: currentUser ? { userId: currentUser.id } : { userId: "" },
        select: { userId: true },
      },
      bookmarks: {
        where: currentUser ? { userId: currentUser.id } : { userId: "" },
        select: { userId: true },
      },
    },
  }) as PostWithDetails[];

  return (
    <div>
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-md border-b border-border-primary px-4 py-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">
            {profileUser.name || profileUser.username}
          </h1>
          <p className="text-[13px] text-text-secondary">
            {postCount} {postCount === 1 ? "post" : "posts"}
          </p>
        </div>
      </div>

      <ProfileHeader
        user={{
          ...profileUser,
          avatar: profileUser.avatar || profileUser.image,
          pinnedTweet: profileUser.pinnedTweet,
          joinDate: profileUser.createdAt,
        }}
        postCount={postCount}
        communityCount={communityCount}
        isOwnProfile={isOwnProfile}
        followerCount={followerCount}
        followingCount={followingCount}
        isFollowing={isFollowing}
        showFollowButton={!isOwnProfile && !!currentUser}
      />

      <InfiniteFeed initialPosts={posts} currentUserId={currentUser?.id} type="profile" authorId={profileUser.id} />
    </div>
  );
}
