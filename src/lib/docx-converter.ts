import mammoth from 'mammoth';
import TurndownService from 'turndown';

/**
 * DOCX to Markdown converter using mammoth and turndown
 */
export class DocxConverter {
  private turndown: TurndownService;

  constructor() {
    this.turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    });
  }

  /**
   * Convert DOCX buffer to Markdown
   */
  async toMarkdown(buffer: Buffer): Promise<string> {
    try {
      // Convert DOCX to HTML using mammoth
      const result = await mammoth.convertToHtml({ buffer });
      let html = result.value;

      // Find first H1 and strip content before it
      const h1Match = html.match(/<h1[^>]*>/i);
      if (h1Match && h1Match.index !== undefined) {
        html = html.substring(h1Match.index);
      }

      // Convert HTML to Markdown
      const markdown = this.turndown.turndown(html);

      return markdown.trim();
    } catch (error) {
      throw new Error(`Failed to convert DOCX to Markdown: ${error}`);
    }
  }
}

export default new DocxConverter();
