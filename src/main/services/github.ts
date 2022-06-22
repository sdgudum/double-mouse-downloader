import { getGotInstance } from '../network';
import IService from './IService';

const fns = {
  async getReleaseInfo() {
    const got = await getGotInstance();
    return got(
      'https://api.github.com/repos/MoyuScript/double-mouse-downloader/releases'
    ).json();
  },
};

const githubService: IService<typeof fns> = {
  name: 'github',
  fns,
};

export default githubService;
