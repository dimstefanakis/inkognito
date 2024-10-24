import { create } from "zustand";
import type { Database, Tables } from "@/types_db";
import { supabase } from "@/utils/supabase";

type PostsStore = {
  posts: Tables<"posts">[];
  setPosts: (posts: Tables<"posts">[]) => void;
  fetchPostById: (id: string) => Promise<Tables<"posts"> | void>;
  fetchPostsByLocationRange: (
    location: { latitude: number; longitude: number },
    range: number,
    saveToStore?: boolean
  ) => Promise<Tables<"posts">[] | void>;
};

export const usePostsStore = create<PostsStore>((set) => ({
  posts: [],
  setPosts: (posts) => set({ posts }),
  fetchPostById: async (id: string) => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id);
    return data?.[0] || undefined;
  },
  fetchPostsByLocationRange: async (
    location: { latitude: number; longitude: number },
    range: number,
    saveToStore = true
  ) => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .gte("lat", location.latitude - range)
      .lte("lat", location.latitude + range)
      .gte("lng", location.longitude - range)
      .lte("lng", location.longitude + range)
      .order("created_at", { ascending: false });
    const posts = data || [];

    if (saveToStore) {
      set({ posts });
    } else {
      return posts;
    }
  },
}));
