import { getAxiosInstance } from '../network';
import IService from './IService';

const fns = {
  async getReleaseInfo() {
    const axios = await getAxiosInstance();
    return (
      await axios(
        'https://api.github.com/repos/MoyuScript/double-mouse-downloader/releases'
      )
    ).data;
  },
};

const githubService: IService<typeof fns> = {
  name: 'github',
  fns,
};

export default githubService;
