import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CreateCommunityForm from "@/components/community/CreateCommunityForm";

export default function CreateCommunityPage() {
  return (
    <div>
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-md border-b border-border-primary px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/communities"
            className="rounded-full p-2 -ml-2 transition-colors hover:bg-bg-hover"
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </Link>
          <h1 className="text-xl font-bold text-text-primary">
            Create Community
          </h1>
        </div>
      </div>

      <div className="px-4 py-6">
        <CreateCommunityForm />
      </div>
    </div>
  );
}
