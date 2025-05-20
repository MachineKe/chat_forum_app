import React from "react";
import MainLayout from "../layouts/MainLayout";
import PostCard from "../components/PostCard";
import Button from "../components/Button";

const Forum = () => {
  // Placeholder for forum logic and fetching posts
  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Forum</h2>
        <Button>New Post</Button>
      </div>
      <div>
        {/* Map forum posts here */}
        <PostCard
          title="Sample Post"
          content="This is a sample forum post."
          author="Alice"
          createdAt="2025-05-20"
        />
        <PostCard
          title="Another Post"
          content="This is another example post."
          author="Bob"
          createdAt="2025-05-19"
        />
      </div>
    </MainLayout>
  );
};

export default Forum;
