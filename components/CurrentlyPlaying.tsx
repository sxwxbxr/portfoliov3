import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function CurrentlyPlaying() {
  return (
    <Card className="overflow-hidden gap-4 pb-0">
      <CardHeader className="pb-0">
        <CardTitle className="text-base">Demon Slayer × Spotify Playlist</CardTitle>
        <CardDescription>
          Stream the soundtrack that&apos;s fueling my current focus sessions.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <iframe
          title="Demon Slayer × Spotify Playlist"
          src="https://open.spotify.com/embed/playlist/3JsgfcruuxFw2jqZYsVPGN?utm_source=generator"
          width="100%"
          height="352"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          allowFullScreen
          className="w-full rounded-xl"
        >
          Your browser does not support iframes.
        </iframe>
      </CardContent>
    </Card>
  )
}
