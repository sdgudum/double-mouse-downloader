import BilibiliBangumiEpisode from './BilibiliBangumiEpisode';

interface BilibiliBangumi {
  title: string;
  cover: string;
  mediaId: string;
  episodes: BilibiliBangumiEpisode[];
}

export default BilibiliBangumi;
