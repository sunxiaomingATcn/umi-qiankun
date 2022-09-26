import FileSave from 'file-saver';

export default (URLToPDF, PDFName) => {
  const oReq = new XMLHttpRequest();
  oReq.open("GET", URLToPDF, true);
  oReq.responseType = "blob";
  oReq.onload = function () {
    const file = new Blob([oReq.response], {
      type: 'application/pdf'
    });
    FileSave.saveAs(file, PDFName);
  };
  oReq.send();
}