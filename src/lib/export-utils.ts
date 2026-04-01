import { Document } from './types'

/**
 * 将正文文本转换为带缩进的段落 HTML
 */
function bodyToHtml(body: string): string {
  if (!body) return ''
  return body
    .split('\n')
    .map((line) => {
      const trimmed = line.replace(/^[\s　]+/, '')
      if (!trimmed) return ''
      return `<p>${trimmed}</p>`
    })
    .filter(Boolean)
    .join('\n')
}

/**
 * 格式化日期为中文格式
 */
function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return dateStr
  }
}

/**
 * 生成公文 HTML 内容（用于导出和预览）
 */
export function generateDocContent(doc: Document): string {
  const parts: string[] = []

  // 发文字号
  if (doc.documentNumber) {
    parts.push(`<div class="doc-number">${doc.documentNumber}</div>`)
  }

  // 签发人
  if (doc.signer) {
    parts.push(`<div class="signer">签发人：${doc.signer}</div>`)
  }

  // 标题
  if (doc.title) {
    parts.push(`<h1>${doc.title}</h1>`)
  }

  // 主送机关
  if (doc.sendTo) {
    parts.push(`<div class="send-to">${doc.sendTo}</div>`)
  }

  // 正文
  if (doc.body) {
    parts.push(`<div class="body-text">${bodyToHtml(doc.body)}</div>`)
  }

  // 附件说明
  if (doc.attachmentNote) {
    parts.push(`<div class="attachment">附件：${doc.attachmentNote}</div>`)
  }

  // 发文机关署名
  if (doc.issuer) {
    parts.push(`<div class="issuer">${doc.issuer}</div>`)
  }

  // 成文日期
  parts.push(`<div class="date">${formatDate(doc.issueDate)}</div>`)

  // 抄送
  if (doc.ccTo) {
    parts.push(`<div class="cc">抄送：${doc.ccTo}</div>`)
  }

  // 印发机关
  if (doc.printOrg) {
    parts.push(`<div class="print-org">${doc.printOrg}${doc.printDate ? `　${formatDate(doc.printDate)}印发` : ''}</div>`)
  }

  return parts.join('\n')
}

/**
 * 生成打印用 CSS（PDF 导出时使用）
 */
export function generatePrintCSS(): string {
  return `
    @page {
      size: A4;
      margin: 3.7cm 2.8cm 3.5cm 2.6cm;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: '仿宋', FangSong, 'STFangsong', serif;
      font-size: 16pt;
      line-height: 28.6pt;
      color: #000;
    }
    h1 {
      font-family: '方正小标宋', '华文中宋', SimSun, STSong, serif;
      font-size: 22pt;
      text-align: center;
      line-height: 1.4;
      font-weight: bold;
      margin-bottom: 20pt;
      letter-spacing: 0.5pt;
    }
    .doc-number {
      text-align: center;
      font-size: 16pt;
      margin-bottom: 20pt;
      color: #333;
    }
    .signer {
      text-align: right;
      font-size: 16pt;
      margin-bottom: 10pt;
    }
    .send-to {
      font-size: 16pt;
      margin-bottom: 10pt;
    }
    .body-text {
      font-size: 16pt;
      line-height: 28.6pt;
      text-align: justify;
    }
    .body-text p {
      text-indent: 2em;
      margin: 0 0 0.3em 0;
    }
    .attachment {
      margin-top: 20pt;
      font-size: 14pt;
    }
    .issuer {
      text-align: right;
      margin-top: 40pt;
      font-size: 16pt;
    }
    .date {
      text-align: right;
      font-size: 14pt;
      margin-top: 4pt;
    }
    .cc {
      margin-top: 30pt;
      font-size: 14pt;
      border-top: 1px solid #000;
      padding-top: 8pt;
    }
    .print-org {
      font-size: 14pt;
      border-bottom: 1px solid #000;
      padding-bottom: 8pt;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  `
}
