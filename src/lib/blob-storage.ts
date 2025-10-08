import { put, del, list, head } from '@vercel/blob';

/**
 * Vercel Blob storage adapter
 * Handles file uploads, downloads, and deletions
 */
export class BlobStorage {
  /**
   * Upload a file to Vercel Blob
   * @param filename - Name of the file
   * @param content - File content (Buffer or string)
   * @param folder - Folder/prefix (docx, templates, generated, enhanced)
   * @returns URL of uploaded file
   */
  static async upload(
    filename: string,
    content: Buffer | string,
    folder: 'docx' | 'templates' | 'generated' | 'enhanced'
  ): Promise<string> {
    try {
      const pathname = `${folder}/${filename}`;
      const blob = await put(pathname, content, {
        access: 'public',
        addRandomSuffix: false,
      });

      return blob.url;
    } catch (error) {
      console.error(`Failed to upload ${filename} to ${folder}:`, error);
      throw new Error(`Failed to upload file: ${error}`);
    }
  }

  /**
   * Download a file from Vercel Blob
   * @param filename - Name of the file
   * @param folder - Folder/prefix
   * @returns File content as Buffer
   */
  static async download(
    filename: string,
    folder: 'docx' | 'templates' | 'generated' | 'enhanced'
  ): Promise<Buffer> {
    try {
      const pathname = `${folder}/${filename}`;
      const { url } = await head(pathname);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error(`Failed to download ${filename} from ${folder}:`, error);
      throw new Error(`Failed to download file: ${error}`);
    }
  }

  /**
   * Download file as text
   */
  static async downloadText(
    filename: string,
    folder: 'docx' | 'templates' | 'generated' | 'enhanced'
  ): Promise<string> {
    const buffer = await this.download(filename, folder);
    return buffer.toString('utf-8');
  }

  /**
   * Delete a file from Vercel Blob
   */
  static async delete(
    filename: string,
    folder: 'docx' | 'templates' | 'generated' | 'enhanced'
  ): Promise<void> {
    try {
      const pathname = `${folder}/${filename}`;
      await del(pathname);
    } catch (error) {
      console.error(`Failed to delete ${filename} from ${folder}:`, error);
      throw new Error(`Failed to delete file: ${error}`);
    }
  }

  /**
   * List all files in a folder
   */
  static async listFiles(
    folder: 'docx' | 'templates' | 'generated' | 'enhanced'
  ): Promise<Array<{ name: string; url: string; size: number; uploadedAt: Date }>> {
    try {
      const { blobs } = await list({
        prefix: `${folder}/`,
      });

      return blobs.map(blob => ({
        name: blob.pathname.replace(`${folder}/`, ''),
        url: blob.url,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
      }));
    } catch (error) {
      console.error(`Failed to list files in ${folder}:`, error);
      return [];
    }
  }

  /**
   * Delete all files in a folder
   */
  static async deleteAllInFolder(
    folder: 'docx' | 'templates' | 'generated' | 'enhanced'
  ): Promise<number> {
    try {
      const files = await this.listFiles(folder);
      let deletedCount = 0;

      for (const file of files) {
        try {
          await this.delete(file.name, folder);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete ${file.name}:`, error);
        }
      }

      return deletedCount;
    } catch (error) {
      console.error(`Failed to delete all files in ${folder}:`, error);
      return 0;
    }
  }

  /**
   * Check if a file exists
   */
  static async exists(
    filename: string,
    folder: 'docx' | 'templates' | 'generated' | 'enhanced'
  ): Promise<boolean> {
    try {
      const pathname = `${folder}/${filename}`;
      await head(pathname);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file URL without downloading
   */
  static async getUrl(
    filename: string,
    folder: 'docx' | 'templates' | 'generated' | 'enhanced'
  ): Promise<string> {
    try {
      const pathname = `${folder}/${filename}`;
      const { url } = await head(pathname);
      return url;
    } catch (error) {
      console.error(`Failed to get URL for ${filename}:`, error);
      throw new Error(`File not found: ${filename}`);
    }
  }
}
