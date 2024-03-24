"use client";
import { useState } from "react";
import { useCreatePost, useLogin, useProfiles } from "@lens-protocol/react-web";
import { textOnly } from "@lens-protocol/metadata";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
// Import Irys
import Irys from "@irys/sdk";
import GaslessUploader from "../components/GasslessUploader";

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
    where: { ownedBy: [address || ""] },
  });

  // Initialize Irys for Arweave data upload
  const getIrys = async () => {
    const url = "https://devnet.irys.xyz";
    const privateKey = process.env.IRYS_KEY;
    const token = "matic";

    const irys = new Irys({
      url,
      token,
      key: privateKey,
    });

    return irys;
  };

  // Upload data to Arweave using Irys
  const uploadToArweave = async (data) => {
    try {
      const irys = await getIrys();
      const receipt = await irys.upload(data);
      return `https://gateway.irys.xyz/${receipt.id}`;
    } catch (error) {
      console.error("Error uploading to Arweave via Irys:", error);
      return null;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!postContent.trim()) return;

    const metadata = textOnly({ content: postContent });
    const uri = await uploadToArweave(JSON.stringify(metadata));
    if (!uri) {
      console.error("Failed to upload metadata to Arweave.");
      return;
    }

    const result = await execute({ metadata: uri });

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
        <button onClick={() => open()} className="button">
          Connect Wallet
        </button>
      )}
      {!data && ownedProfiles?.length && isConnected && (
        <button
          onClick={() =>
            login({
              address: address || "",
              profileId: ownedProfiles[ownedProfiles.length - 1].id,
            })
          }
          className="button"
        >
          Login with Lens
        </button>
      )}
      <h1>Create a Post</h1>
      <GaslessUploader showImageView={true} showReceiptView={true} />
      <form onSubmit={handleSubmit}>
        <input
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder="What's on your mind?"
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
