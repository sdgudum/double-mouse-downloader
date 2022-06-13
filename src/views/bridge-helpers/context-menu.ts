import { MenuItemConstructorOptions } from 'electron';
import { clone } from 'lodash';

interface MenuItemConstructorOptionsOverride
  extends MenuItemConstructorOptions {
  click?: () => void;
}

/**
 *
 * @param opts 上下文菜单配置，注意 click 回调实际没有任何参数传入。
 */
export async function showContextMenu(
  opts: MenuItemConstructorOptionsOverride[]
) {
  const callbackMap = new Map<
    string,
    MenuItemConstructorOptionsOverride['click']
  >();
  const optsToSend = clone(opts) as any[];

  function walkOpts(opts: any[]) {
    opts.forEach((opt) => {
      if (opt.click) {
        const uuid = crypto.randomUUID();
        callbackMap.set(uuid, opt.click);
        opt.click = uuid;
      }

      if (opt.submenu) {
        walkOpts(opt.submenu);
      }
    });
  }

  walkOpts(optsToSend);
  const clickedItemUuid = await jsBridge.contextMenu.show(optsToSend);
  // @ts-ignore 因为肯定存在
  callbackMap.get(clickedItemUuid)();
}
