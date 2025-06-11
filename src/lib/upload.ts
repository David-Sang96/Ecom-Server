import pLimit from 'p-limit';
import cloudinary from '../lib/cloudinary';
import AppError from '../utils/AppError';

const limit = pLimit(5);

export const uploadSingleFile = async (
  file: string
): Promise<{ secure_url: string; public_id: string }> => {
  try {
    const { secure_url, public_id } = await cloudinary.uploader.upload(file, {
      transformation: [
        { width: 800, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });
    return { secure_url, public_id };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new AppError('File uploading failed', 500);
  }
};

export const uploadMultipleFiles = async (
  files: string[]
): Promise<{ secure_url: string; public_id: string }[]> => {
  try {
    const uploadFiles = files.map((file) => {
      return limit(async () => {
        const result = await cloudinary.uploader.upload(file, {
          transformation: [
            { width: 800, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        });
        return result;
      });
    });
    const result = await Promise.all(uploadFiles);
    return result.map((item) => ({
      secure_url: item.secure_url,
      public_id: item.public_id,
    }));
  } catch (error) {
    console.error('Cloudinary multiple upload error:', error);
    throw new AppError('Files uploading failed', 500);
  }
};

export const deleteSingleFile = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new AppError('File deleting failed', 500);
  }
};

export const deleteMultipleFiles = async (
  publicIds: string[]
): Promise<void> => {
  try {
    // Create an array of promises for deleting each image
    const deletePromises = publicIds.map((publicId) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        });
      });
    });

    const results = await Promise.all(deletePromises);
    console.log('All images deleted successfully:', results);
  } catch (error) {
    console.error('Cloudinary multiple delete  error:', error);
    throw new AppError('Files deleting failed', 500);
  }
};
