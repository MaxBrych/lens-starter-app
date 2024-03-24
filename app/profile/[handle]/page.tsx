// app/profile/[handle]/page.tsx
"use client";
import { Button } from "../../components/ui/button";
import {
  useProfile,
  usePublications,
  LimitType,
  PublicationType,
  useLogin,
  useProfiles,
  useFollow,
} from "@lens-protocol/react-web";
import type { Profile } from "@lens-protocol/react-web";

import { useWeb3Modal } from "@web3modal/wagmi/react";
import { Grab, Heart, MessageSquare, Repeat2 } from "lucide-react";
import { useAccount } from "wagmi";

export default function Profile({ params: { handle } }) {
  const namespace = handle.split(".")[1];
  handle = handle.split(".")[0];
  let { data: profile, loading } = useProfile({
    forHandle: `${namespace}/${handle}`,
  });
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { execute: login, data } = useLogin();
  const { execute: follow } = useFollow();
  const { data: ownedProfiles } = useProfiles({
    where: {
      ownedBy: [address || ""],
    },
  });

  if (!profile) return null;

  if (loading) return <p className="p-14">Loading ...</p>;
  return (
    <div>
      <div className="p-14">
        {profile?.metadata?.picture?.__typename === "ImageSet" && (
          <img
            width="200"
            height="200"
            alt={profile.handle?.fullHandle}
            className="rounded-xl"
            src={profile.metadata.picture.optimized?.uri}
          />
        )}
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
        {data && profile.operations.canFollow !== "NO" && (
          <button
            className="px-4 py-2 mt-4 mb-6 border rounded border-zinc-600"
            onClick={() => (profile ? follow({ profile: profile }) : null)}
          >
            Follow
          </button>
        )}
        <h1 className="my-3 text-3xl">
          {profile?.handle?.localName}.{profile?.handle?.namespace}
        </h1>
        <h3 className="mb-4 text-xl">{profile?.metadata?.bio}</h3>
        {profile && <Publications profile={profile} />}
      </div>
    </div>
  );
}

function Publications({ profile }: { profile: Profile }) {
  let { data: publications } = usePublications({
    where: {
      publicationTypes: [PublicationType.Post],
      from: [profile.id],
    },
    limit: LimitType.TwentyFive,
  });

  return (
    <>
      {publications?.map((pub: any, index: number) => (
        <a
          href={`https://testnet.hey.xyz/posts/${pub.id}`}
          key={index}
          className="flex flex-col px-4 py-4 mb-3 rounded bg-zinc-900"
        >
          <p>{pub.metadata.content}</p>
          {pub.metadata?.asset?.image?.optimized?.uri && (
            <img
              width="400"
              height="400"
              alt={profile.handle?.fullHandle}
              className="mt-6 mb-2 rounded-xl"
              src={pub.metadata?.asset?.image?.optimized?.uri}
            />
          )}
          <div className="mt-4">
            <Button className="mr-1 rounded-full" variant="secondary">
              <MessageSquare className="w-4 h-4 mr-2" />
              {pub.stats.comments}
            </Button>
            <Button className="mr-1 rounded-full" variant="secondary">
              <Repeat2 className="w-4 h-4 mr-2" />
              {pub.stats.mirrors}
            </Button>

            <Button className="mr-1 rounded-full" variant="secondary">
              <Heart className="w-4 h-4 mr-2" />
              {pub.stats.upvotes}
            </Button>
            <Button className="mr-1 rounded-full" variant="secondary">
              <Grab className="w-4 h-4 mr-2" />
              {pub.stats.collects}
            </Button>
          </div>
        </a>
      ))}
    </>
  );
}
