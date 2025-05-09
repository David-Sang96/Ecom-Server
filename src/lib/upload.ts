import pLimit from 'p-limit';
import cloudinary from '../lib/cloudinary';
import AppError from '../utils/AppError';

const limit = pLimit(5);

export const uploadSingleFile = async (
  file: string
): Promise<{ secure_url: string; public_id: string }> => {
  try {
    const { secure_url, public_id } = await cloudinary.uploader.upload(file);
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
        const result = await cloudinary.uploader.upload(file);
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
): Promise<string[]> => {
  try {
    const deleteResults = await Promise.all(
      publicIds.map((public_id) =>
        cloudinary.uploader.destroy(public_id).then((res) => {
          if (res.result !== 'ok')
            throw new AppError(`Failed to delete: ${public_id}`, 500);
          return public_id;
        })
      )
    );
    return deleteResults;
  } catch (error) {
    console.error('Cloudinary multiple delete  error:', error);
    throw new AppError('Files deleting failed', 500);
  }
};
