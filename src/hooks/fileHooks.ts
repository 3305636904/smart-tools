import { fs, dialog } from '@tauri-apps/api';

export async function saveFile(binaryData: any, filename: string = 'defaultFileName', extensions = ['*']) {
  
  const filePath = await dialog.save({
    title: '保存文件',
    defaultPath: filename, // 可以是文件名或路径
    filters: [{ name: 'All Files', extensions }]
  });
  
  if (filePath) {
    await fs.writeBinaryFile({
      path: filePath,
      contents: binaryData
    });
  }
}

// 根据响应头处理文件
export function handleFile(disposition: string) {
  let fileName = ''
  let fileType = ''
  const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
  const matches = filenameRegex.exec(disposition)
  if (matches != null && matches[1]) {
    fileName = decodeURIComponent(matches[1].replace(/['"]/g, '')).split('.')[0]
    fileType = decodeURIComponent(matches[1].replace(/['"]/g, '')).split('.')[1]
  }
  return { fileName, fileType }
}