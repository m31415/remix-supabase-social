import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Session } from "@supabase/supabase-js";
import type { Database } from "database.types";

type Post = Database["public"]["Tables"]["posts"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// Combine types to create PostWithAuthorAndLikes
export type PostWithAuthorAndLikes = Post & {
  author: Profile | null;
  likes: { user_id: string }[];
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUserDataFromSession(session: Session) {
  const userId = session.user.id;
  const userAvatarUrl = session.user.user_metadata.avatar_url;
  const userName = session.user.user_metadata.user_name;

  return { userId, userAvatarUrl, userName };
}

export type CombinedPostsWithAuthorAndLikes = ReturnType<
  typeof combinePostsWithLikes
>;

export function combinePostsWithLikes(
  data: PostWithAuthorAndLikes[] | null,
  sessionUserId: string
) {
  const posts =
    data?.map((post) => {
      return {
        ...post,
        isLikedByUser: !!post.likes.find(
          (like) => like.user_id === sessionUserId
        ),
        likes: post.likes.length,
        author: post.author!, // cannot be null
      };
    }) ?? [];

  return posts;
}

export function formatToTwitterDate(dateTimeString: string) {
  const date = new Date(dateTimeString);

  const day = date.getDate();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes();

  // Convert hours to AM/PM format
  const amPM = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert hours to 12-hour format

  const formattedDate = `${hours}:${
    minutes < 10 ? "0" : ""
  }${minutes} ${amPM} · ${month} ${day}, ${year}`;

  return formattedDate;
}
