/**
 * Template variable parser and JSON processor
 */
export class TemplateProcessor {
  /**
   * Parse template variables from enhanced content
   */
  static parseVariables(content: string, docxFilename: string = ''): Record<string, string> {
    const sections: Record<string, string> = {};

    if (docxFilename) {
      sections['template_name'] = docxFilename;
    }

    // Universal parser: extract ALL key: value patterns
    const pattern = /^([a-zA-Z0-9_]+):\s*(.+?)(?=\r?\n[a-zA-Z0-9_]+:\s*|$)/gms;
    let match;

    while ((match = pattern.exec(content)) !== null) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (key && value) {
        sections[key] = value;
      }
    }

    return sections;
  }

  /**
   * Process template by replacing placeholders with variables
   */
  static processTemplate(templateJson: any, variables: Record<string, string>): string {
    const replacer = (obj: any): any => {
      if (typeof obj === 'string') {
        return obj.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, key) => {
          return variables[key.trim()] || '';
        });
      } else if (Array.isArray(obj)) {
        return obj.map(replacer);
      } else if (typeof obj === 'object' && obj !== null) {
        const newObj: any = {};
        for (const [key, value] of Object.entries(obj)) {
          newObj[key] = replacer(value);
        }
        return newObj;
      }
      return obj;
    };

    const result = replacer(templateJson);
    return JSON.stringify(result, null, 2);
  }
}

export default TemplateProcessor;
