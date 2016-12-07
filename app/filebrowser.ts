import { fs } from 'mz';
import * as path from 'path';
import { XMPlay } from './xmplay';

interface DirectoryInformation {
  location: string;
  items: (IStorageItem | false)[];
}

interface IStorageItem {
  kind: IStorageKind;
  name: 'string';
}

type IStorageKind = 'file' | 'folder';

export class FileBrowser {
  public async getItemsInFolder(folder: string): Promise<DirectoryInformation> {
    try {
      const items = await fs.readdir(folder);
      folder = path.resolve(folder);
      const res   = await Promise.all(
        items.map(async (item: string) => {
          const itemAbsolutePath = path.join(folder, item);
          const stat = await fs.stat(itemAbsolutePath);

          if (stat.isDirectory()) {
            return <IStorageItem>{
              name: item,
              kind: 'folder'
            };
          } else if (this.isSupportedFile(item)) {
            return <IStorageItem>{
              name: item,
              kind: 'file'
            };
          }

          return false;
        })
      );

      return {
        location: folder,
        items: res.filter(Boolean)
      };
    } catch (err) {
      throw new Error(`Accessing the requested path was not possible at this point.`);
    };
  }

  private isSupportedFile(fileName): boolean {
    return XMPlay.SUPPORTED_EXTENSIONS.test(
            path.extname(fileName)
              .toLowerCase()
              .substring(1)
           );
  }
}

export const filebrowser = new FileBrowser();
