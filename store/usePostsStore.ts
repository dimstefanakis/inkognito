import { create } from "zustand";
import type { Database, Tables } from "@/types_db";

type PostsStore = {
  posts: Tables<"posts">[];
  setPosts: (posts: Tables<"posts">[]) => void;
};

export const usePostsStore = create<PostsStore>((set) => ({
  posts: [],
  setPosts: (posts) => set({ posts }),
}));
