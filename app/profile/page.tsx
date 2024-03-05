"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import {
  useProfiles,
  usePublications,
  PublicationType,
  ProfileId,
} from "@lens-protocol/react-web";
import ReactMarkdown from "react-markdown";
import { MessageSquare, Repeat, Heart, Grab } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfileWrapper() {
  const { address } = useAccount();
  if (!address) return null;

  return <Profile address={address} />;
}

function Profile({ address }) {
  const { data: profileData } = useProfiles({
    where: {
      ownedBy: [address],
    },
  });

  const [profileId, setProfileId] = useState<ProfileId | any>(null);

  useEffect(() => {
    if (profileData && profileData.length > 0) {
      const profile = profileData[profileData.length - 1];
      setProfileId(profile.id);
    }
  }, [profileData]);

  const {
    data: publications,
    loading,
    error,
  } = usePublications({
    where: {
      from: [profileId],
      publicationTypes: [PublicationType.Post],
    },
  });

  if (!profileData || !profileData.length) return null;
  const profile = profileData[profileData.length - 1];
  if (!profile) return null;

  return (
    <main className="px-10 py-14">
      <div>
        <a
          rel="no-opener"
          target="_blank"
          href={`https://share.lens.xyz/u/${profile.handle?.localName}.${profile.handle?.namespace}`}
        >
          <div className="p-10 border rounded-lg">
            <div>
              {profile.metadata?.picture?.__typename === "ImageSet" && (
                <img
                  src={profile?.metadata?.picture?.optimized?.uri}
                  className="rounded w-[200px]"
                />
              )}
            </div>
            <div className="mt-4">
              <p className="text-lg">{profile?.metadata?.displayName}</p>
              <p className="font-medium text-muted-foreground">
                {profile?.handle?.localName}.{profile?.handle?.namespace}
              </p>
            </div>
          </div>
        </a>
        <div className="mt-8">
          <h2 className="text-2xl font-semibold">Posts</h2>
          <ul>
            {publications?.map((publication, idx) => (
              <li
                key={`${publication.id}-${idx}`}
                className="py-4 mt-4 border-b"
              >
                <div>
                  {publication.metadata?.asset?.image?.original?.url && (
                    <img
                      src={publication.metadata.asset.image.original.url}
                      alt="Publication"
                      className="max-w-full mb-4 rounded-lg"
                    />
                  )}
                  <ReactMarkdown>{publication.metadata.content}</ReactMarkdown>
                  <div className="flex mt-2 space-x-4">
                    <Button
                      className="flex items-center rounded-full"
                      variant="secondary"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {publication.stats.comments}
                    </Button>
                    <Button
                      className="flex items-center rounded-full"
                      variant="secondary"
                    >
                      <Repeat className="w-4 h-4 mr-2" />
                      {(publication.stats.mirrors as any) || 0}
                    </Button>
                    <Button
                      className="flex items-center rounded-full"
                      variant="secondary"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      {publication.stats.upvotes as any}
                    </Button>
                    <Button
                      className="flex items-center rounded-full"
                      variant="secondary"
                    >
                      <Grab className="w-4 h-4 mr-2" />
                      {publication.stats.collects}
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
