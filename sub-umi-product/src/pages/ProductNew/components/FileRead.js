/**
 * 读文件
 * file {name:'', url:''}
*/
import FileViewer from 'react-file-viewer';
import PdfView from '@/components/PdfView';

export default ({ file }) => {
  const fileType = file.url && file.url.split(".").pop();
  return fileType === "pdf" ?
    <PdfView
      data={{ path: file.url }}
    /> :
    <FileViewer
      fileType={fileType}
      filePath={file.url}
    />
}