export function downloadTextFile(filename: string, text: string) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

export function uploadTextFile(callback: (file: string) => void, accept?: string) {
  const element = document.createElement('input');
  element.style.display = 'none';
  element.type = 'file';
  element.accept = accept || '';
  
  element.addEventListener('change', () => {
      const files = element.files;
      if (!files || files.length === 0) {
        return;
      }

      const reader = new FileReader();
      reader.addEventListener('load', () => {
        if (typeof reader.result === "string") {
          callback(reader.result);
        }
      })
      reader.readAsText(files[0])
  });

  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
