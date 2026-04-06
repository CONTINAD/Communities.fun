import { PostWithDetails } from "@/types";
import PostCard from "./PostCard";

interface PostFeedProps {
  posts: PostWithDetails[];
  currentUserId?: string;
}

export default function PostFeed({ posts, currentUserId }: PostFeedProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <h3 className="text-text-primary text-xl font-bold mb-1">
          No posts yet
        </h3>
        <p className="text-text-secondary text-[15px] text-center max-w-sm">
          When members post, their posts will show up here. Be the first to
          start the conversation.
        </p>
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={currentUserId} />
      ))}
    </div>
  );
}
