export function detectResource(text: string): {
  type: 'video';
  id: string;
} | null {
  const trimmedText = text.trim();

  // 资源 ID 测试
  if (/^BV\w{10}$/.test(trimmedText)) {
    // 视频 BV 号：BV1GJ411x7h7
    return {
      type: 'video',
      id: text,
    };
  }

  try {
    // URL 检测
    const url = new URL(trimmedText);

    if (['http:', 'https:'].includes(url.protocol)) {
      // 确保 B 站域名
      if (
        ['bilibili.com', 'www.bilibili.com', 'm.bilibili.com'].includes(
          url.hostname
        )
      ) {
        // 视频链接：https://www.bilibili.com/video/BV1GJ411x7h7
        const match = url.pathname.match(/^\/video\/(BV\w{10})\/?$/);

        if (match) {
          return {
            type: 'video',
            id: match[1],
          };
        }
      }
    }
  } catch (err) {
    /** 不处理 URL 解析错误 */
  }

  return null;
}
