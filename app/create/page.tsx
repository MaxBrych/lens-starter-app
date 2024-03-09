"use client";
import { useState, useEffect } from "react";
import { useCreatePost, useLogin, useProfiles } from "@lens-protocol/react-web";
import { textOnly } from "@lens-protocol/metadata";
import { useAccount } from "wagmi";

const CreatePostComponent = () => {
  const { address, isConnected } = useAccount();
  const { execute: login, data } = useLogin();


  const { data: ownedProfiles } = useProfiles({
    where: {
      ownedBy: [address || ""],
    },
  });

  const {
    data: profilesData,
    loading: profilesLoading,
    error: profilesError,
  } = useProfiles({
    where: { ownedBy: [address] },
  });

  // Assuming the first profile is the active one
  const activeProfile = profilesData?.[0];




  const post = (content: string) => {
    // Post creation logic
  const {
    execute,
    error: createPostError,
    loading: createPostLoading,
  } = useCreatePost();
  const [postContent, setPostContent] = useState("");


    // create the desired metadata via the `@lens-protocol/metadata` package helpers
    const metadata = textOnly({ content });
  
    // upload the metadata to a storage provider of your choice (IPFS in this example)
    const uri = await uploadToIpfs(metadata);

    // invoke the `execute` function to create the post
  const result = await execute({
    metadata: uri,
  });

  if (result.isFailure()) {
    switch (result.error.name) {
      case 'BroadcastingError':
        console.log('There was an error broadcasting the transaction', error.message);
        break;

      case 'PendingSigningRequestError':
        console.log(
          'There is a pending signing request in your wallet. ' +
            'Approve it or discard it and try again.'
        );
        break;

      case 'WalletConnectionError':
        console.log('There was an error connecting to your wallet', error.message);
        break;

      case 'UserRejectedError':
        // the user decided to not sign, usually this is silently ignored by UIs
        break;
    }
    return;
  }
  // this might take a while, depends on the type of tx (on-chain or Momoka)
  // and the congestion of the network
  const completion = await result.value.waitForCompletion();

  if (completion.isFailure()) {
    console.log('There was an processing the transaction', completion.error.message);
    return;
  }

  const handlePostContentChange = (event) => {
    setPostContent(event.target.value);
  };

  // the post is now ready to be used
  const post = completion.value;
  console.log('Post created', post);
};
  }

  useEffect(() => {
    if (!address) {
      console.log("Wallet not connected");
    }
  }, [address]);

 

 

  if (profilesLoading) return <div>Loading profile...</div>;
  if (profilesError)
    return <div>Error loading profile: {profilesError.message}</div>;

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
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        ></input>
        
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
