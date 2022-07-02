import BilibiliBangumiEpisode from './BilibiliBangumiEpisode';
import BilibiliBangumiRelativeVideo from './BilibiliBangumiRelativeVideo';

interface BilibiliBangumi {
  title: string;
  cover: string;
  mediaId: string;
  episodes: BilibiliBangumiEpisode[];
  relativeVideos: BilibiliBangumiRelativeVideo[];
}

export default BilibiliBangumi;
