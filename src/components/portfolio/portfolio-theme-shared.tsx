import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Dispatch, SetStateAction } from "react";
import type { PortfolioRecord } from "@/lib/portfolio-service";

type LightboxProps = {
  lightbox: { urls: string[]; index: number } | null;
  setLightbox: Dispatch<SetStateAction<{ urls: string[]; index: number } | null>>;
};

export function PortfolioThemeLightbox({ lightbox, setLightbox }: LightboxProps) {
  if (!lightbox) return null;
  return (
    <div
      className="no-print fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
      onClick={() => setLightbox(null)}
      role="presentation"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-6xl items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => setLightbox(null)}
          className="absolute right-2 top-2 z-10 rounded-full border border-white/20 bg-zinc-950/90 px-3 py-1.5 text-xs text-white"
        >
          Close
        </button>
        {lightbox.urls.length > 1 ? (
          <button
            type="button"
            aria-label="Previous"
            onClick={() =>
              setLightbox((prev) =>
                prev ? { ...prev, index: (prev.index - 1 + prev.urls.length) % prev.urls.length } : prev,
              )
            }
            className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-zinc-950/90 p-2 text-white md:left-2"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        ) : null}
        {lightbox.urls.length > 1 ? (
          <button
            type="button"
            aria-label="Next"
            onClick={() => setLightbox((prev) => (prev ? { ...prev, index: (prev.index + 1) % prev.urls.length } : prev))}
            className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-zinc-950/90 p-2 text-white md:right-2"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        ) : null}
        <img src={lightbox.urls[lightbox.index]} alt="" className="max-h-[88vh] w-auto max-w-[92vw] rounded-xl border border-white/10 object-contain" />
        {lightbox.urls.length > 1 ? (
          <p className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs text-zinc-300">
            {lightbox.index + 1} / {lightbox.urls.length}
          </p>
        ) : null}
      </div>
    </div>
  );
}

type PrintBarProps = {
  data: PortfolioRecord;
  visitorChrome: boolean;
  isOwner: boolean;
  user: { id: string } | null;
  hasApi: boolean;
  setVisitorPreview: (next: boolean) => void;
  sectionClassName: string;
  buttonPrimaryClass: string;
  buttonMutedClass: string;
  poweredByClass?: string;
  homeLinkClass?: string;
};

export function PortfolioThemePrintBar({
  data,
  visitorChrome,
  isOwner,
  user,
  hasApi,
  setVisitorPreview,
  sectionClassName,
  buttonPrimaryClass,
  buttonMutedClass,
  poweredByClass = "text-xs opacity-70",
  homeLinkClass = "mt-2 block text-sm opacity-70 hover:opacity-100",
}: PrintBarProps) {
  return (
    <section className={`no-print border-t px-5 py-10 md:px-10 ${sectionClassName}`}>
      <div className="mx-auto flex max-w-5xl flex-wrap gap-3">
        {data.cvUrl ? (
          <a
            href={data.cvUrl}
            download={data.cvFileName || `${data.fullName}-CV`}
            className={buttonPrimaryClass}
          >
            Download CV
          </a>
        ) : null}
        <button type="button" onClick={() => window.print()} className={buttonMutedClass}>
          Print / PDF
        </button>
        {visitorChrome ? (
          <>
            {!user && hasApi ? (
              <Link to="/auth" className={buttonMutedClass}>
                Create your portfolio
              </Link>
            ) : null}
            {user && !isOwner ? (
              <Link to="/app" className={buttonMutedClass}>
                Dashboard
              </Link>
            ) : null}
          </>
        ) : (
          <>
            <Link to="/app" className={buttonMutedClass}>
              Edit in dashboard
            </Link>
            <button type="button" onClick={() => setVisitorPreview(true)} className={buttonMutedClass}>
              Preview as visitor
            </button>
          </>
        )}
      </div>
      <div className="mx-auto mt-8 max-w-5xl text-center">
        {data.showPoweredBy ? (
          <p className={poweredByClass}>
            Made with{" "}
            <Link to="/" className="underline underline-offset-4">
              PortfolioForge
            </Link>
          </p>
        ) : null}
        <Link to="/" className={homeLinkClass}>
          ← Home
        </Link>
      </div>
    </section>
  );
}
