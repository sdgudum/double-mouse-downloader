import IFeature from './IFeature';
import { close, minimize } from '../../services/window-control-service';

const windowControlFeature: IFeature = {
  name: 'windowControl',
  apis: {
    close(ev, windowName: string) {
      close(windowName);
    },

    minimize(ev, windowName: string) {
      minimize(windowName);
    },
  },
};

export default windowControlFeature;
