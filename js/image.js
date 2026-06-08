const ImageUtil = (() => {
  const MAX_SIZE = 400;
  const QUALITY = 0.85;

  /**
   * 压缩图片文件为 base64
   * @param {File} file - 来自 input 的图片文件
   * @returns {Promise<string>} base64 data URL
   */
  function compress(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          const { width, height } = img;

          // 计算缩放后的尺寸，保持宽高比，最大不超过 MAX_SIZE
          let scaledWidth = width;
          let scaledHeight = height;

          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              scaledWidth = MAX_SIZE;
              scaledHeight = Math.round((height / width) * MAX_SIZE);
            } else {
              scaledHeight = MAX_SIZE;
              scaledWidth = Math.round((width / height) * MAX_SIZE);
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = scaledWidth;
          canvas.height = scaledHeight;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

          const base64 = canvas.toDataURL('image/jpeg', QUALITY);
          resolve(base64);
        };

        img.onerror = () => {
          reject(new Error('图片加载失败'));
        };

        img.src = e.target.result;
      };

      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * 将 base64 大小格式化为可读字符串
   * @param {string} base64 - base64 data URL
   * @returns {string} 如 "25.3 KB"
   */
  function formatSize(base64) {
    const bytes = Math.round((base64.length * 3) / 4);
    if (bytes < 1024) return bytes + ' B';
    return (bytes / 1024).toFixed(1) + ' KB';
  }

  return { compress, formatSize };
})();
