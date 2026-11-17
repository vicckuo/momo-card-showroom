/** 本地產生的 placeholder 圖，不使用 momo 圖片、不發任何外部請求。 */
export function placeholderImage(label: string, hue: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
<rect width="400" height="400" fill="hsl(${hue} 60% 88%)"/>
<text x="200" y="210" font-size="36" text-anchor="middle" fill="hsl(${hue} 40% 35%)" font-family="sans-serif">${label}</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
