import React from "react";

type Props = {
  isConnected: boolean;
  fortune: string | null;
  isCracking: boolean;
  hasCracked: boolean;
  onCrack: () => void;
  onMint: () => void;
  onConnect: () => void;
  mintDisabled: boolean;
  connectDisabled: boolean;
  mintPriceLabel: string;
  statusLabel?: string | null;
  mintPhase: "idle" | "wallet" | "confirming" | "success";
};

export function FortuneCookie({
  isConnected,
  fortune,
  isCracking,
  hasCracked,
  onCrack,
  onMint,
  onConnect,
  mintDisabled,
  connectDisabled,
  mintPriceLabel,
  statusLabel,
  mintPhase,
}: Props) {
  const crackCta = hasCracked ? "Crack again" : "Crack your fortune cookie";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-[#0b1628] via-[#0f1d32] to-[#13283c] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
      <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-10 h-44 w-44 rounded-full bg-amber-400/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(247,177,77,0.1),transparent_35%),radial-gradient(circle_at_70%_40%,rgba(76,201,240,0.08),transparent_30%)]" />

      <div className="relative flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-[0.28em] text-amber-100">
            Holiday Fortune Cookie
          </div>
        </div>

        <div className="text-slate-200">
          Crack a cookie under neon lanterns, reveal a holiday crypto pun, and mint it onchain.
        </div>

        <div className="relative flex flex-col items-center gap-4">
          <button
            className="group relative flex w-full max-w-[520px] flex-col items-center justify-center overflow-hidden rounded-[32px] border border-amber-200/25 bg-gradient-to-br from-slate-100/25 via-amber-50/20 to-cyan-100/15 shadow-[0_15px_60px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:scale-[1.01] focus:outline-none sm:flex-row sm:h-64 sm:max-w-[560px]"
            onClick={isConnected ? onCrack : onConnect}
            disabled={(!isConnected && connectDisabled) || isCracking}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/18 to-transparent opacity-70" />
            <div className="absolute inset-0 blur-2xl bg-amber-200/18 group-hover:bg-amber-200/28 transition-colors" />

            <div className="relative z-10 flex h-full w-full flex-col items-center gap-4 px-4 py-4 sm:flex-row sm:items-center sm:gap-5 sm:px-5">
              <div className="relative flex w-full justify-center sm:flex-1">
                <div className="relative h-44 w-44 sm:h-52 sm:w-52">
                  <img
                    src="/fortune_cookie.svg"
                    alt="Fortune cookie closed"
                    className={`absolute inset-0 h-full w-full object-contain transition-all duration-500 will-change-transform ${
                      hasCracked ? "opacity-0 scale-90" : "opacity-100 scale-105"
                    } ${isCracking ? "crack-anim" : ""}`}
                  />
                  <img
                    src="/fortune_cookie_opened.svg"
                    alt="Fortune cookie opened"
                    className={`absolute inset-0 h-full w-full object-contain transition-all duration-500 will-change-transform ${
                      hasCracked && !isCracking ? "opacity-100 scale-112 translate-y-1" : "opacity-0 scale-90 translate-y-3"
                    }`}
                  />
                </div>
              </div>

              <div className="relative flex w-full items-center justify-center sm:flex-1">
                {fortune && (
                  <div
                    className={`w-full max-w-[320px] rounded-xl bg-white/95 px-6 py-4 text-center text-base font-semibold text-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition-all duration-500 ${
                      hasCracked ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                    }`}
                  >
                    {fortune}
                  </div>
                )}
              </div>
            </div>

            <div
              className={`absolute bottom-4 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.3em] transition-all duration-300 ${
                hasCracked ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
              }`}
            >
              <span className="rounded-full bg-white/18 px-3 py-1 text-[11px] font-semibold text-cyan-100 shadow-[0_6px_20px_rgba(0,0,0,0.25)]">
                {isConnected ? "Tap to crack" : "Connect to crack"}
              </span>
            </div>
          </button>

          <div className="flex w-full flex-col gap-3">
            {!isConnected ? (
              <button
                className="w-full rounded-2xl bg-cyan-500 px-5 py-3 text-base font-semibold text-slate-900 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={onConnect}
                disabled={connectDisabled}
              >
                Connect wallet to crack cookies
              </button>
            ) : (
              <button
                className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-cyan-400 px-5 py-3 text-base font-semibold text-slate-900 shadow-[0_12px_50px_rgba(0,0,0,0.35)] transition hover:translate-y-[-2px] hover:shadow-[0_15px_60px_rgba(0,0,0,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={hasCracked ? onMint : onCrack}
                disabled={mintDisabled || isCracking}
              >
                {hasCracked ? "Mint this fortune" : crackCta}
              </button>
            )}
            {statusLabel && (
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-cyan-100">
                {statusLabel}
              </div>
            )}
            {mintPhase === "success" && (
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-100">
                Mint confirmed. Your holiday fortune is onchain.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FortuneCookie;
