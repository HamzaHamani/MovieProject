import {
  getSpecifiedTV,
  getTVEpisodeDetails,
  getTVSeasonDetails,
} from "@/lib/actions";
import TvEpisodesSection from "./tvEpisodesSection";
import TvSeasonEpisodesSection from "./tvSeasonEpisodesSection";
import TvEpisodeDetailsSection from "./tvEpisodeDetailsSection";

type Props = {
  id: number;
  selectedSeason?: number | null;
  selectedEpisode?: number | null;
};

export default async function TvEpisodesSectionAsync({
  id,
  selectedSeason,
  selectedEpisode,
}: Props) {
  if (selectedSeason && selectedSeason > 0 && selectedEpisode && selectedEpisode > 0) {
    try {
      const episode = await getTVEpisodeDetails(
        String(id),
        selectedSeason,
        selectedEpisode,
      );
      return (
        <TvEpisodeDetailsSection
          tvId={id}
          seasonNumber={selectedSeason}
          episode={episode}
        />
      );
    } catch {
      // Fall through to episodes list if episode endpoint fails.
    }
  }

  if (selectedSeason && selectedSeason > 0) {
    try {
      const season = await getTVSeasonDetails(String(id), selectedSeason);
      return <TvSeasonEpisodesSection tvId={id} season={season} />;
    } catch {
      // If season endpoint fails, gracefully fall back to seasons list.
    }
  }

  const response = await getSpecifiedTV(String(id));
  return <TvEpisodesSection response={response} />;
}
