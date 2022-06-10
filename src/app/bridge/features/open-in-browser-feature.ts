import * as openInBrowserService from '../../services/open-in-browser-service';
import IFeature from './IFeature';

const openInBrowserFeature: IFeature = {
  name: 'openInBrowser',
  apis: {
    async open(ev, url: string) {
      await openInBrowserService.open(url);
    },
  },
};

export default openInBrowserFeature;

export interface OpenInBrowserFeatureApis {
  open: (url: string) => Promise<void>;
}
