import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import PostCard from "@/components/post/PostCard";
import { PostWithDetails } from "@/types";

export default async function BookmarksPage() {
  const user = await requireAuth();

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      post: {
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
            where: { userId: user.id },
            select: { userId: true },
          },
          bookmarks: {
            where: { userId: user.id },
            select: { userId: true },
          },
        },
      },
    },
  });

  const posts = bookmarks.map((b) => b.post) as unknown as PostWithDetails[];

  return (
    <div>
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-md border-b border-border-primary px-4 py-3">
        <h1 className="text-xl font-bold text-text-primary">Bookmarks</h1>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <h3 className="text-text-primary text-xl font-bold mb-2">
            No bookmarks yet
          </h3>
          <p className="text-text-secondary text-[15px] text-center max-w-sm">
            Bookmark posts to save them for later
          </p>
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={user.id} />
          ))}
        </div>
      )}
    </div>
  );
}
