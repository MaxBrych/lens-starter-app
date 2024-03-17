import { NextResponse, NextRequest } from "next/server";
import Irys from "@irys/sdk";

const TOP_UP = "200000000000000000"; // 0.2 MATIC
const MIN_FUNDS = 0.05;

export async function POST(req: NextRequest) {
  const body = await req.arrayBuffer();
  const buffer = Buffer.from(body);

  const getIrysArweave = async () => {
    const url = "https://devnet.irys.xyz";
    const token = "arweave";
    const key = process.env.NEXT_PUBLIC_BUNDLR_KEY;

    const irys = new Irys({
      url, // URL of the node you want to connect to
      token, // Token used for payment and signing
      key, // Arweave wallet
    });
    return irys;
  };
  await irys.ready();

  let balance = await irys.getLoadedBalance();
  let readableBalance = irys.utils.fromAtomic(balance).toNumber();

  if (readableBalance < MIN_FUNDS) {
    await irys.fund(TOP_UP);
  }

  const tx = await irys.upload(buffer, {
    tags: [{ name: "Content-Type", value: "image/png" }],
  });

  return NextResponse.json({ txId: `https://arweave.net/${tx.id}` });
}
