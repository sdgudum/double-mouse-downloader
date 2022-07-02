import BilibiliBangumiEpisode from './BilibiliBangumiEpisode';

interface BilibiliBangumiRelativeVideo extends BilibiliBangumiEpisode {
  bvid: string;
  cid: number;
  title: string;
  cover: string;
  badgeText: string;
  vipOnly: boolean;
}

export default BilibiliBangumiRelativeVideo;
