"use client";
import { useState, useEffect } from "react";
import { useCreatePost, useProfiles } from "@lens-protocol/react-web";
import { textOnly } from "@lens-protocol/metadata";
import { useAccount } from "wagmi";

const CreatePostComponent = () => {
  const { address } = useAccount();
  const {
    data: profilesData,
    loading: profilesLoading,
    error: profilesError,
  } = useProfiles({
    where: { ownedBy: [address] },
  });

  // Assuming the first profile is the active one
  const activeProfile = profilesData?.[0];

  const {
    execute,
    error: createPostError,
    loading: createPostLoading,
  } = useCreatePost();
  const [postContent, setPostContent] = useState("");
  const [postResult, setPostResult] = useState(null);

  useEffect(() => {
    if (!address) {
      console.log("Wallet not connected");
    }
  }, [address]);

  const handlePostContentChange = (event) => {
    setPostContent(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!postContent.trim() || !activeProfile) {
      console.error("Post content is empty or no active profile found.");
      return;
    }

    const metadata = textOnly({ content: postContent });
    // Ensure you replace the following mock implementation with actual IPFS upload logic
    const uri = "ipfs://bafy...mock";

    try {
      const result = await execute({
        profileId: activeProfile.id,
        metadata: uri,
      });
      if (result.error) {
        console.error("Failed to create post:", result.error);
        return;
      }
      console.log("Post created successfully:", result.data);
      setPostResult(result.data);
      setPostContent(""); // Clear the input field after successful post creation
    } catch (err) {
      console.error("Error creating post:", err);
    }
  };

  if (profilesLoading) return <div>Loading profile...</div>;
  if (profilesError)
    return <div>Error loading profile: {profilesError.message}</div>;

  return (
    <div>
      <h1>Create a Post</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={postContent}
          onChange={handlePostContentChange}
          placeholder="What's on your mind?"
          required
        />
        <button
          type="submit"
          disabled={createPostLoading || !postContent.trim()}
        >
          {createPostLoading ? "Creating..." : "Create Post"}
        </button>
      </form>
      {createPostError && <div>Error: {createPostError.message}</div>}
      {postResult && <div>Post created successfully!</div>}
    </div>
  );
};

export default CreatePostComponent;
