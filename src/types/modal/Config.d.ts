interface Config {
  download: {
    path: string;
    videoFileNamePattern: string;
    showDownloadGuidance: boolean;
    videoQuality: number;
    audioQuality: number;
  };
  proxy: {
    enable: boolean;
    useSystemProxy: boolean;
    url: string;
  };
  cookieString: string;
  update: {
    autoCheck: boolean;
  };
}

export default Config;
