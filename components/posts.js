"use client";

import { formatDate } from "@/lib/format";
import LikeButton from "./like-icon";

import { toggleLikes } from "@/actions/posts";
import { useOptimistic } from "react";
import Image from "next/image";

const imageLoader = (config) => {
  const urlStart = config.src.split("upload")[0];
  const urlEnd = config.src.split("upload")[1];
  const transformations = `w_200,q_${config.quality}`;
  return `${urlStart}/upload/${transformations}/${urlEnd}`;
};

function Post({ post, action }) {
  return (
    <article className="post">
      <div className="post-image">
        <Image
          src={post.image}
          alt={post.title}
          loader={imageLoader}
          quality={50}
          width={200}
          height={150}
        />
      </div>
      <div className="post-content">
        <header>
          <div>
            <h2>{post.title}</h2>
            <p>
              Shared by {post.userFirstName} on{" "}
              <time dateTime={post.createdAt}>
                {formatDate(post.createdAt)}
              </time>
            </p>
          </div>
          <div>
            <form
              action={action.bind(null, post.id)}
              className={post.isLiked ? "liked" : ""}
            >
              <LikeButton />
            </form>
          </div>
        </header>
        <p>{post.content}</p>
      </div>
    </article>
  );
}

export default function Posts({ posts }) {
  // perform optimistic updates on the client side
  const [optimiscticPost, updateOptimisticPost] = useOptimistic(
    posts,
    (prevState, updatedPostId) => {
      // find the post that was updated
      const updatedPostIndex = prevState.findIndex(
        (post) => post.id === updatedPostId
      );

      // if the post was not found, return the previous state
      if (updatedPostIndex === -1) {
        return prevState;
      }

      // update the post with the new like count and status
      const updatedPost = { ...prevState[updatedPostIndex] };
      // update the like count and status
      updatedPost.likes = updatedPost.likes + (updatedPost.isLiked ? 1 : -1);
      // toggle the like status
      updatedPost.isLiked = !updatedPost.isLiked;

      // create a new array with the updated post
      const updatedPosts = [...prevState];
      // replace the old post with the updated post
      updatedPosts[updatedPostIndex] = updatedPost;

      return updatedPosts;
    }
  );

  if (!optimiscticPost || optimiscticPost.length === 0) {
    return <p>There are no posts yet. Maybe start sharing some?</p>;
  }

  // update the post with the new like count and status
  const updatePost = async (postId) => {
    updateOptimisticPost(postId);
    await toggleLikes(postId);
  };

  return (
    <ul className="posts">
      {optimiscticPost.map((post) => (
        <li key={post.id}>
          <Post post={post} action={updatePost} />
        </li>
      ))}
    </ul>
  );
}
