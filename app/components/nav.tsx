"use client";
import { Button } from "./ui/button";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";
import { disconnect } from "@wagmi/core";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ModeToggle } from "./dropdown";
import { ChevronRight, Droplets, LogOut } from "lucide-react";
import { useProfiles, ProfileId } from "@lens-protocol/react-web";
import { useEffect, useState } from "react";

export function Nav() {
  const { open } = useWeb3Modal();
  const { address } = useAccount();
  const pathname = usePathname();

  // Always call `useProfiles` at the top level
  const { data: profileData } = useProfiles({
    where: {
      ownedBy: [address ? address : ""], // Ensure the argument is always provided, even if falsy
    },
  });

  const [profileId, setProfileId] = useState<ProfileId | any>(null);

  useEffect(() => {
    if (profileData && profileData.length > 0) {
      const profile = profileData[profileData.length - 1];
      setProfileId(profile.id);
    }
  }, [profileData]);

  // Determine the last profile for use in the profile link. Avoid using early return.
  const lastProfile =
    profileData && profileData.length > 0
      ? profileData[profileData.length - 1]
      : null;

  return (
    <nav className="flex flex-col items-start border-b sm:flex-row sm:items-center sm:pr-10">
      <div className="flex items-center flex-1 px-8 py-3">
        <Link href="/" className="flex items-center mr-5">
          <Droplets className="opacity-85" size={19} />
          <p className="ml-2 mr-4 text-lg font-semibold">lenscn</p>
        </Link>
        <Link
          href="/"
          className={`mr-5 text-sm ${pathname !== "/" && "opacity-50"}`}
        >
          <p>Home</p>
        </Link>
        <Link
          href="/search"
          className={`mr-5 text-sm ${pathname !== "/search" && "opacity-60"}`}
        >
          <p>Search</p>
        </Link>
        {lastProfile && (
          <Link
            href={`/profile/${lastProfile.handle?.localName}.${lastProfile.handle?.namespace}`}
            className={`mr-5 text-sm ${
              pathname !==
                `/profile/${lastProfile.handle?.localName}.${lastProfile.handle?.namespace}` &&
              "opacity-60"
            }`}
          >
            <p>Profile</p>
          </Link>
        )}
      </div>
      <div className="flex pb-3 pl-8 sm:items-center sm:p-0">
        {!address ? (
          <Button onClick={() => open()} variant="secondary" className="mr-4">
            Connect Wallet
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={disconnect} variant="secondary" className="mr-4">
            Disconnect
            <LogOut className="w-4 h-4 ml-3" />
          </Button>
        )}
        <ModeToggle />
      </div>
    </nav>
  );
}
