import { BlobStorage } from './blob-storage';

/**
 * Vercel Blob Storage Adapter
 * Wraps BlobStorage to match the FileStorage interface
 */
export class FileStorage {
  /**
   * Read a file
   * @param dirName Directory (docx, templates, enhanced, generated)
   * @param filename Filename
   * @returns File buffer
   */
  static async readFile(dirName: string, filename: string): Promise<Buffer | null> {
    try {
      return await BlobStorage.download(filename, dirName as any);
    } catch (error) {
      console.error(`Failed to read ${filename} from ${dirName}:`, error);
      return null;
    }
  }

  /**
   * Write a file
   * @param dirName Directory (docx, templates, enhanced, generated)
   * @param filename Filename
   * @param buffer File buffer
   * @returns Success boolean
   */
  static async writeFile(dirName: string, filename: string, buffer: Buffer): Promise<boolean> {
    try {
      await BlobStorage.upload(filename, buffer, dirName as any);
      return true;
    } catch (error: any) {
      console.error(`Failed to write ${filename} to ${dirName}:`, error);
      return false;
    }
  }

  /**
   * List files in a directory
   * @param dirName Directory (docx, templates, enhanced, generated)
   * @returns Array of filenames
   */
  static async listFiles(dirName: string): Promise<string[]> {
    try {
      const files = await BlobStorage.listFiles(dirName as any);
      return files.map(f => f.name);
    } catch (error) {
      console.error(`Failed to list files in ${dirName}:`, error);
      return [];
    }
  }

  /**
   * Delete a file
   * @param dirName Directory
   * @param filename Filename
   * @returns Success boolean
   */
  static async deleteFile(dirName: string, filename: string): Promise<boolean> {
    try {
      await BlobStorage.delete(filename, dirName as any);
      console.log(`✅ Blob storage delete successful: ${filename}`);
      return true;
    } catch (error: any) {
      console.error(`❌ Blob storage delete failed:`, error);
      return false;
    }
  }

  /**
   * Delete all files in a directory
   * @param dirName Directory
   * @returns Number of files deleted
   */
  static async deleteDirectory(dirName: string): Promise<number> {
    try {
      return await BlobStorage.deleteAllInFolder(dirName as any);
    } catch (error) {
      console.error(`Failed to delete directory ${dirName}:`, error);
      return 0;
    }
  }

  /**
   * Check if a file exists
   * @param dirName Directory
   * @param filename Filename
   * @returns True if exists
   */
  static async fileExists(dirName: string, filename: string): Promise<boolean> {
    try {
      return await BlobStorage.exists(filename, dirName as any);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get storage type
   */
  static async getStorageType(): Promise<'vercel-blob'> {
    return 'vercel-blob';
  }

  /**
   * Get public URL for a file
   * @param dirName Directory
   * @param filename Filename
   * @returns Blob URL
   */
  static async getPublicUrl(dirName: string, filename: string): Promise<string> {
    try {
      return await BlobStorage.getUrl(filename, dirName as any);
    } catch (error) {
      console.error(`Failed to get URL for ${filename}:`, error);
      return '';
    }
  }

  /**
   * List files with metadata (size, etc.)
   * @param dirName Directory
   * @returns Array of file objects
   */
  static async listFilesWithMetadata(dirName: string): Promise<Array<{ name: string; size: number }>> {
    try {
      const files = await BlobStorage.listFiles(dirName as any);
      return files.map(f => ({
        name: f.name,
        size: f.size
      }));
    } catch (error) {
      console.error(`Failed to list files with metadata in ${dirName}:`, error);
      return [];
    }
  }
}
