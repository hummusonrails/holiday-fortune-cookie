import { useEffect, useMemo, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useAccount, useConnect, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther, parseEventLogs } from "viem";

import HolidayFortuneAbi from "./abi/HolidayFortune.json";
import FortuneCookie from "./components/FortuneCookie";
import { generateFortune } from "./utils/fortuneGenerator";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;
const MINT_PRICE_WEI = 100000000000000n; // 0.0001 ETH

export default function App() {
  const { isConnected, address } = useAccount();
  const { connect, connectors, error: connectError, status: connectStatus } = useConnect();
  const { writeContractAsync, isPending: isWritePending, error: writeError } = useWriteContract();

  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { data: receipt, isLoading: isConfirming, isSuccess: isMintSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const [fortune, setFortune] = useState<string | null>(null);
  const [isCracking, setIsCracking] = useState(false);
  const [hasCracked, setHasCracked] = useState(false);
  const [mintPhase, setMintPhase] = useState<"idle" | "wallet" | "confirming" | "success">("idle");
  const [pendingFortune, setPendingFortune] = useState<string | null>(null);
  const [mintedFortune, setMintedFortune] = useState<string | null>(null);
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null);
  const [mintError, setMintError] = useState<string | null>(null);

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  const mintPriceEth = useMemo(() => formatEther(MINT_PRICE_WEI), []);

  const crackCookie = () => {
    setMintError(null);
    setMintPhase("idle");
    setMintedTokenId(null);
    setMintedFortune(null);
    setPendingFortune(null);
    const nextFortune = generateFortune();
    setIsCracking(true);
    setHasCracked(true);
    setTimeout(() => {
      setFortune(nextFortune);
      setIsCracking(false);
    }, 180);
  };

  const connectWallet = () => {
    const preferred = connectors.find((connector) => connector.ready) ?? connectors[0];
    if (preferred) {
      connect({ connector: preferred });
    }
  };

  const handleMint = async () => {
    if (!fortune) {
      crackCookie();
      return;
    }
    if (!isConnected) {
      connectWallet();
      return;
    }
    setMintError(null);
    setPendingFortune(fortune);
    setMintPhase("wallet");
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: HolidayFortuneAbi,
        functionName: "mint",
        args: [fortune],
        value: MINT_PRICE_WEI,
      });
      setTxHash(hash);
      setMintPhase("confirming");
    } catch (err) {
      setMintPhase("idle");
      setPendingFortune(null);
      setMintError((err as Error).message);
    }
  };

  useEffect(() => {
    if (!isMintSuccess || !receipt) return;
    let tokenId: string | null = null;
    try {
      const events = parseEventLogs({
        abi: HolidayFortuneAbi,
        eventName: "FortuneMinted",
        logs: receipt.logs ?? [],
      });
      const last = events.at(-1);
      if (last?.args?.tokenId) {
        tokenId = (last.args.tokenId as bigint).toString();
      }
    } catch (err) {
      console.warn("Failed to parse mint logs", err);
    }
    setMintPhase("success");
    setMintedFortune(pendingFortune ?? fortune);
    setMintedTokenId(tokenId);
  }, [isMintSuccess, receipt, pendingFortune, fortune]);

  const shareToFarcaster = () => {
    const appUrl = "https://farcaster.xyz/miniapps/9ehldX_kietX/holiday-fortune-cookie";
    const imageUrl = `https://holiday-fortune-cookie.onrender.com/fortune_cookie_opened.png`;
    const text = mintedFortune
      ? `Minted a Holiday Fortune Cookie on Arbitrum: "${mintedFortune}" 🍪🔮\n${appUrl}`
      : `Crack a Holiday Fortune Cookie and mint your crypto pun on Arbitrum!\n${appUrl}`;
    sdk.actions.composeCast({
      text,
      embeds: [imageUrl] as [string],
    });
  };

  const truncatedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
  const isMinting = isWritePending || isConfirming;

  const statusLabel = (() => {
    if (mintError) return `Error: ${mintError}`;
    if (mintPhase === "wallet" || isWritePending) return "Waiting for wallet confirmation...";
    if (isConfirming) return "Minting your fortune...";
    if (mintPhase === "success" && mintedTokenId) return `Mint confirmed · Token #${mintedTokenId}`;
    if (mintPhase === "success") return "Mint confirmed. Fortune sealed onchain.";
    return null;
  })();

  const txUrl =
    receipt && receipt.transactionHash
      ? `https://arbiscan.io/tx/${receipt.transactionHash}`
      : undefined;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#090f1a] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,235,0.12),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(251,191,36,0.1),transparent_30%),radial-gradient(circle_at_80%_80%,rgba(56,189,248,0.08),transparent_28%)]" />
      <main className="relative z-10 mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 lg:px-8">
        <header className="flex flex-col gap-3">
          <h1 className="text-4xl font-bold text-amber-100 sm:text-5xl">Holiday Fortune Cookie</h1>
          <p className="max-w-2xl text-slate-200">
            Crack the cookie, reveal a holiday crypto pun, and mint it on Arbitrum.
          </p>
          {address && (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-100 shadow-lg">
              <span className="text-xs uppercase tracking-[0.2em] text-cyan-200">Connected</span>
              <span className="font-mono">{truncatedAddress}</span>
            </div>
          )}
        </header>

        <FortuneCookie
          isConnected={isConnected}
          fortune={fortune}
          isCracking={isCracking}
          hasCracked={hasCracked}
          onCrack={crackCookie}
          onMint={handleMint}
          onConnect={connectWallet}
          mintDisabled={isMinting}
          connectDisabled={connectStatus === "pending"}
          mintPriceLabel={mintPriceEth}
          statusLabel={statusLabel}
          mintPhase={mintPhase}
        />

        {mintedFortune && (
          <div className="flex flex-col gap-3 rounded-3xl border border-emerald-300/25 bg-emerald-400/10 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Your onchain fortune</p>
            <p className="text-lg font-semibold text-white">{mintedFortune}</p>
            <p className="text-xs text-emerald-200">
              {mintedTokenId ? `Token #${mintedTokenId}` : "Awaiting token id from receipt"}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-xl bg-emerald-300 px-3 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-200"
                onClick={shareToFarcaster}
              >
                Share to Farcaster
              </button>
              {txUrl && (
                <a
                  href={txUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-emerald-200/50 bg-transparent px-3 py-2 text-sm text-emerald-100 underline-offset-4 hover:underline"
                >
                  View on explorer
                </a>
              )}
            </div>
          </div>
        )}

        {(writeError || connectError) && (
          <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {(writeError || connectError)?.message}
          </div>
        )}
      </main>
    </div>
  );
}
