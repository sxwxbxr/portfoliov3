"use client"

import { ConsentIframe, useConsent } from "@permitojs/react"
import { copy } from "@/lib/copy"

/**
 * 16:9 YouTube frame that loads nothing until the visitor agrees to the
 * `youtube` service. The placeholder says why, and one button both grants
 * consent and starts the video, so there is no detour through the settings.
 */
export function YouTubeEmbed({ youtubeId, title }: { youtubeId: string; title: string }) {
  const { setServiceConsent, openPreferences } = useConsent()

  return (
    <div className="well relative aspect-video w-full overflow-hidden p-1.5">
      <ConsentIframe
        service="youtube"
        src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}`}
        title={title}
        unstyled
        loading="lazy"
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="h-full w-full rounded-md border-0"
        placeholderClassName="flex h-full w-full"
        placeholder={
          <div className="flex h-full w-full flex-col items-start justify-center gap-4 p-5 md:p-8">
            <p className="text-lg tracking-tight text-fg">
              {copy.packages.consentTitle}
            </p>
            <p className="measure text-sm leading-relaxed text-fg-muted">
              {copy.packages.consentBody}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setServiceConsent("youtube", true)}
                className="control control-primary px-4 py-2 text-sm"
              >
                {copy.packages.consentAccept}
              </button>
              <button
                type="button"
                onClick={openPreferences}
                className="control px-4 py-2 text-sm"
              >
                {copy.packages.consentSettings}
              </button>
            </div>
          </div>
        }
      />
    </div>
  )
}
