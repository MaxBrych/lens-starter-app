"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import {
  useProfiles,
  usePublications,
  PublicationType,
  ProfileId,
} from "@lens-protocol/react-web";

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

  // State to store the profile ID once it's available
  const [profileId, setProfileId] = useState<ProfileId | any>(null);

  // Update profileId state when profile data is loaded
  useEffect(() => {
    if (profileData && profileData.length > 0) {
      const profile = profileData[profileData.length - 1];
      setProfileId(profile.id);
    }
  }, [profileData]);

  // Call usePublications hook with the profileId
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!publications || publications.length === 0)
    return <div>No posts found.</div>;

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
            {publications.map((publication, idx) => (
              <li key={`${publication.id}-${idx}`} className="mt-4">
                <p>{(publication as any).metadata.content}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
