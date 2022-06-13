import IFeature from './IFeature';
import { Menu, MenuItemConstructorOptions } from 'electron';
import { cloneDeep } from 'lodash';

const contextMenuFeature: IFeature = {
  name: 'contextMenu',
  apis: {
    async show(ev, opts: any[]): Promise<string> {
      return new Promise((resolve) => {
        const clonedOpts = cloneDeep(opts);

        function mapClick(opts: any[]) {
          opts.forEach((opt) => {
            if (opt.click) {
              const uuid = opt.click;
              const callback: MenuItemConstructorOptions['click'] = () => {
                resolve(uuid);
              };
              opt.click = callback;
            }

            if (opt.submenu) {
              mapClick(opt.submenu);
            }
          });
        }

        mapClick(clonedOpts);
        const menu = Menu.buildFromTemplate(clonedOpts);
        menu.popup();
      });
    },
  },
};

export default contextMenuFeature;
