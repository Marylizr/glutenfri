import { isNativeRuntime } from './platform.js';

export async function downloadAccountExport(data, {
  native = isNativeRuntime(),
  document = globalThis.document,
  urlApi = globalThis.URL,
  now = () => new Date(),
  loadFilesystem = () => import('@capacitor/filesystem'),
  loadShare = () => import('@capacitor/share'),
} = {}) {
  const filename = `mis-datos-glutenfri-${now().toISOString().replace(/[:.]/g, '-')}.json`;
  const json = JSON.stringify(data, null, 2);
  if (!native) {
    const url = urlApi.createObjectURL(new Blob([json], { type: 'application/json' }));
    const link = document.createElement('a');
    try {
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
    } finally {
      link.remove();
      // Do not revoke before the browser has started consuming the download.
      setTimeout(() => urlApi.revokeObjectURL(url), 1000);
    }
    return;
  }
  const { Filesystem, Directory, Encoding } = await loadFilesystem();
  const { Share } = await loadShare();
  const path = `exports/${filename}`;
  const file = await Filesystem.writeFile({ path, directory: Directory.Cache, encoding: Encoding.UTF8, data: json, recursive: true });
  try {
    await Share.share({ files: [file.uri] });
  } catch (error) {
    if (error?.message !== 'Share canceled') throw error;
    // Cancelling is not an export failure; still erase the temporary file.
  } finally {
    await Filesystem.deleteFile({ path, directory: Directory.Cache });
  }
}
