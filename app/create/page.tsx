"use client";
import { useState, useEffect } from "react";
import { useCreatePost, useLogin, useProfiles } from "@lens-protocol/react-web";
import { textOnly } from "@lens-protocol/metadata";
import { useAccount } from "wagmi";
import { storage } from "../../lib/utils";
import { useWeb3Modal } from "@web3modal/wagmi/react";

const CreatePostComponent = () => {
  const [postContent, setPostContent] = useState("");
  const {
    execute,
    error: createPostError,
    loading: createPostLoading,
  } = useCreatePost();
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { execute: login, data } = useLogin();
  const { data: ownedProfiles } = useProfiles({
    where: {
      ownedBy: [address || ""],
    },
  });

  // Upload metadata to IPFS using ThirdwebStorage
  const uploadToIpfs = async (metadata) => {
    try {
      const uri = await storage.upload(metadata);
      return uri;
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      return null;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!postContent.trim()) return;

    // create the desired metadata via the `@lens-protocol/metadata` package helpers
    const metadata = textOnly({ content: postContent });
    const uri = await uploadToIpfs(metadata);
    if (!uri) {
      console.error("Failed to upload metadata to IPFS.");
      return;
    }

    // invoke the `execute` function to create the post
    const result = await execute({
      metadata: uri,
    });

    if (result.isFailure()) {
      console.error("Failed to create post:", result.error.message);
      return;
    }

    const completion = await result.value.waitForCompletion();
    if (completion.isFailure()) {
      console.error(
        "Error processing the transaction:",
        completion.error.message
      );
      return;
    }

    console.log("Post created", completion.value);
  };

  return (
    <div>
      {!isConnected && (
        <button
          className="px-4 py-2 mt-4 mb-6 border rounded border-zinc-600"
          onClick={() => open()}
        >
          Connect Wallet
        </button>
      )}
      {!data && ownedProfiles?.length && isConnected && (
        <button
          className="px-4 py-2 mt-4 mb-6 border rounded border-zinc-600"
          onClick={() =>
            login({
              address: address || "",
              profileId: ownedProfiles[ownedProfiles.length - 1].id,
            })
          }
        >
          Login with Lens
        </button>
      )}
      <h1>Create a Post</h1>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="What's on your mind?"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          required
        />
        <button type="submit" disabled={createPostLoading}>
          {createPostLoading ? "Creating..." : "Create Post"}
        </button>
      </form>
      {createPostError && <div>Error: {createPostError.message}</div>}
    </div>
  );
};

export default CreatePostComponent;
