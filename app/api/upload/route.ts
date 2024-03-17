import { NextResponse, NextRequest } from "next/server";
import Irys from "@irys/sdk";


// process.env.BNDLR_KEY
const TOP_UP = "200000000000000000"; // 0.2 MATIC
const MIN_FUNDS = 0.05;

export async function POST(req: NextRequest) {
  const data = await req.json();
  const irys = new Irys(    "https://devnet.irys.xyz",
    "matic",
    key: process.env.NEXT_PUBLIC_BUNDLR_KEY
  );
  await irys.ready();
  let balance = await irys.getLoadedBalance();
  let readableBalance = irys.utils.fromAtomic(balance).toNumber();

  if (readableBalance < MIN_FUNDS) {
    await irys.fund(TOP_UP);
  }

  const tx = await irys.upload(data, {
    tags: [{ name: "Content-Type", value: "application/json" }],
  });

  return NextResponse.json({ txId: `https://arweave.net/${tx.id}` });
}