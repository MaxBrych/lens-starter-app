"use client";
import { useState } from "react";
import {
  useExploreProfiles,
  useExplorePublications,
  ExploreProfilesOrderByType,
  ExplorePublicationsOrderByType,
  ExplorePublicationType,
  LimitType,
} from "@lens-protocol/react-web";

import {
  Loader2,
  ListMusic,
  Newspaper,
  PersonStanding,
  Shapes,
  MessageSquare,
  Repeat2,
  Heart,
  Grab,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

enum PublicationMetadataMainFocusType {
  Article = "ARTICLE",
  Audio = "AUDIO",
  CheckingIn = "CHECKING_IN",
  Embed = "EMBED",
  Event = "EVENT",
  Image = "IMAGE",
  Link = "LINK",
  Livestream = "LIVESTREAM",
  Mint = "MINT",
  ShortVideo = "SHORT_VIDEO",
  Space = "SPACE",
  Story = "STORY",
  TextOnly = "TEXT_ONLY",
  ThreeD = "THREE_D",
  Transaction = "TRANSACTION",
  Video = "VIDEO",
}

export default function Home() {
  const [view, setView] = useState("profiles");
  const [dashboardType, setDashboardType] = useState("dashboard");
  let {
    data: profiles,
    error: profileError,
    loading: loadingProfiles,
  } = useExploreProfiles({
    limit: LimitType.TwentyFive,
    orderBy: ExploreProfilesOrderByType.MostFollowers,
  }) as any;

  let { data: musicPubs, loading: loadingMusicPubs } = useExplorePublications({
    limit: LimitType.TwentyFive,
    orderBy: ExplorePublicationsOrderByType.TopCommented,
    where: {
      publicationTypes: [ExplorePublicationType.Post],
      metadata: {
        mainContentFocus: [PublicationMetadataMainFocusType.Audio],
      },
    },
  }) as any;

  let { data: publications, loading: loadingPubs } = useExplorePublications({
    limit: LimitType.TwentyFive,
    orderBy: ExplorePublicationsOrderByType.LensCurated,
    where: {
      publicationTypes: [ExplorePublicationType.Post],
    },
  }) as any;

  profiles = profiles?.filter((p) => p.metadata?.picture?.optimized?.uri);

  publications = publications?.filter((p) => {
    if (p.metadata && p.metadata.asset) {
      if (p.metadata.asset.image) return true;
      return false;
    }
    return true;
  });

  return (
    <main className="px-6 py-14 sm:px-10">
      <div>
        <a target="_blank" rel="no-opener" href="https://lens.xyz">
          <div className="cursor-pointer flex items-center bg-secondary text-foreground rounded-lg py-1 px-3 mb-2 max-w-[288px]">
            <p className="mr-2">📚</p>
            <p className="text-sm">Learn more about Lens Protocol.</p>
            <ArrowRight className="ml-2" size={14} />
          </div>
        </a>
        <h1 className="mt-3 text-5xl font-bold">Social Explorer</h1>
        <p className="mt-4 max-w-[750px] text-lg text-muted-foreground sm:text-xl">
          An application boilerplate built with a modern stack. Simple to get
          started building your first social app. Leveraging ShadCN, Lens
          Protocol, Next.js, and WalletConnect.
        </p>
      </div>

      <div className="mt-[70px] flex ml-2">
        <div>
          <Button
            variant="ghost"
            onClick={() => setDashboardType("dashboard")}
            className={`${dashboardType !== "dashboard" ? "opacity-60" : ""}`}
          >
            My dashboard
          </Button>
        </div>
        <div className="ml-4">
          <Button
            variant="ghost"
            onClick={() => setDashboardType("algorithms")}
            className={`${
              dashboardType !== "recommendation algorithms" ? "opacity-50" : ""
            }`}
          >
            Choose your algorithm
          </Button>
        </div>
      </div>

      {dashboardType === "algorithms" && (
        <div className="md:flex min-h-[300px] mt-3 px-6">
          <p>Choose your algorithm coming soon...</p>
        </div>
      )}
      {dashboardType === "dashboard" && (
        <div className="md:flex min-h-[300px] mt-3">
          <div className="border border rounded-tl rounded-bl md:w-[230px] pt-3 px-2 pb-8 flex-col flex">
            <p className="mt-1 mb-2 ml-4 font-medium">Social Views</p>
            <Button
              onClick={() => setView("profiles")}
              variant={view === "profiles" ? "secondary" : "ghost"}
              className="justify-start mb-1"
            >
              <PersonStanding size={16} />
              <p className="ml-2 text-sm">Profiles</p>
            </Button>
            <Button
              onClick={() => setView("publications")}
              variant={view === "publications" ? "secondary" : "ghost"}
              className="justify-start mb-1"
            >
              <Newspaper size={16} />
              <p className="ml-2 text-sm">Publications</p>
            </Button>
            <Button
              onClick={() => setView("music")}
              variant={view === "music" ? "secondary" : "ghost"}
              className="justify-start mb-1"
            >
              <ListMusic size={16} />
              <p className="ml-2 text-sm">Music</p>
            </Button>
            <Button
              onClick={() => setView("collect")}
              variant={view === "collect" ? "secondary" : "ghost"}
              className="justify-start mb-1"
            >
              <Shapes size={16} />
              <p className="ml-2 text-sm">Collect</p>
            </Button>
          </div>
          <div className="flex flex-1 pb-4 rounded-tr rounded-br sm:border-t sm:border-r sm:border-b">
            {view === "profiles" && (
              <div className="flex flex-wrap flex-1 p-4">
                {loadingProfiles && (
                  <div className="flex items-center justify-center flex-1 ">
                    <Loader2 className="w-12 h-12 animate-spin" />
                  </div>
                )}
                {profiles?.map((profile) => (
                  <Link
                    className="p-4 cursor-pointer lg:w-1/4 sm:w-1/2"
                    href={`/profile/${profile.handle?.localName}.${profile.handle?.namespace}`}
                    key={profile.id}
                  >
                    <div className="space-y-3">
                      <div className="overflow-hidden rounded-md">
                        <img
                          className="object-cover w-auto h-auto transition-all hover:scale-105 aspect-square"
                          src={profile.metadata?.picture?.optimized?.uri}
                        />
                      </div>
                      <div className="space-y-1 text-sm">
                        <h3 className="font-medium leading-none">
                          {profile.handle.localName}.{profile.handle.namespace}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {profile.metadata?.displayName}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {view === "publications" && (
              <div className="flex flex-col flex-wrap flex-1">
                {loadingPubs && (
                  <div className="flex items-center justify-center flex-1 ">
                    <Loader2 className="w-12 h-12 animate-spin" />
                  </div>
                )}
                {publications?.map((publication) => (
                  <div
                    className="border-b"
                    key={publication.id}
                    onClick={() =>
                      window.open(
                        `https://share.lens.xyz/p/${publication.id}`,
                        "_blank"
                      )
                    }
                  >
                    <div className="px-2 pt-6 pb-2 mb-4 space-y-3 sm:px-6">
                      <div className="flex">
                        <Avatar>
                          <AvatarImage
                            src={
                              publication.by?.metadata?.picture?.optimized?.uri
                            }
                          />
                          <AvatarFallback>
                            {publication.by.handle.localName.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <h3 className="mb-1 font-medium leading-none">
                            {publication.by.handle.localName}.
                            {publication.by.handle.namespace}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {publication.by.metadata?.displayName}
                          </p>
                        </div>
                      </div>
                      <div>
                        <img
                          className={cn(`
                            max-w-full sm:max-w-[500px]
                            rounded-2xl h-auto object-cover transition-all hover:scale-105
                            `)}
                          src={
                            publication.__typename === "Post"
                              ? publication.metadata?.asset?.image?.optimized
                                  ?.uri
                              : ""
                          }
                        />
                        <ReactMarkdown className="mt-4 break-words ">
                          {publication.metadata.content.replace(
                            /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi,
                            "[LINK]($1)"
                          )}
                        </ReactMarkdown>
                      </div>
                      <div>
                        <Button
                          className="mr-1 rounded-full"
                          variant="secondary"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          {publication.stats.comments}
                        </Button>
                        <Button
                          className="mr-1 rounded-full"
                          variant="secondary"
                        >
                          <Repeat2 className="w-4 h-4 mr-2" />
                          {publication.stats.mirrors}
                        </Button>
                        <Button
                          className="mr-1 rounded-full"
                          variant="secondary"
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          {publication.stats.upvotes}
                        </Button>
                        <Button
                          className="mr-1 rounded-full"
                          variant="secondary"
                        >
                          <Grab className="w-4 h-4 mr-2" />
                          {publication.stats.collects}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {view === "music" && (
              <div className="flex flex-col flex-wrap flex-1">
                {loadingMusicPubs && (
                  <div className="flex items-center justify-center flex-1 ">
                    <Loader2 className="w-12 h-12 animate-spin" />
                  </div>
                )}
                {musicPubs?.map((publication) => (
                  <div
                    className="border-b"
                    key={publication.id}
                    onClick={() =>
                      window.open(
                        `https://share.lens.xyz/p/${publication.id}`,
                        "_blank"
                      )
                    }
                  >
                    <div className="p-4 mb-4 space-y-3">
                      <div className="flex">
                        <Avatar>
                          <AvatarImage
                            src={
                              publication.by?.metadata?.picture?.optimized?.uri
                            }
                          />
                          <AvatarFallback>
                            {publication.by.handle.fullHandle.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <h3 className="mb-1 font-medium leading-none">
                            {publication.by.handle.localName}.
                            {publication.by.handle.namespace}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {publication.by.handle.fullName}
                          </p>
                        </div>
                      </div>
                      <div>
                        <img
                          className={cn(`
                             max-w-full sm:max-w-[500px] mb-3
                             rounded-2xl h-auto object-cover transition-all hover:scale-105
                             `)}
                          src={
                            publication.__typename === "Post"
                              ? publication.metadata?.asset?.cover?.optimized
                                  ?.uri
                                ? publication.metadata?.asset?.cover?.optimized
                                    ?.uri
                                : publication.metadata?.asset?.cover?.optimized
                                    ?.raw?.uri
                              : ""
                          }
                        />
                        <audio controls>
                          <source
                            type={
                              publication.metadata?.asset?.audio?.optimized
                                ?.mimeType
                            }
                            src={
                              publication.metadata?.asset?.audio?.optimized?.uri
                            }
                          />
                        </audio>
                        <ReactMarkdown className="mt-4 break-words ">
                          {publication.metadata.content.replace(
                            /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi,
                            "[LINK]($1)"
                          )}
                        </ReactMarkdown>
                      </div>
                      <div>
                        <Button
                          className="mr-1 rounded-full"
                          variant="secondary"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          {publication.stats.comments}
                        </Button>
                        <Button
                          className="mr-1 rounded-full"
                          variant="secondary"
                        >
                          <Repeat2 className="w-4 h-4 mr-2" />
                          {publication.stats.mirrors}
                        </Button>
                        <Button
                          className="mr-1 rounded-full"
                          variant="secondary"
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          {publication.stats.upvotes}
                        </Button>
                        <Button
                          className="mr-1 rounded-full"
                          variant="secondary"
                        >
                          <Grab className="w-4 h-4 mr-2" />
                          {publication.stats.collects}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
