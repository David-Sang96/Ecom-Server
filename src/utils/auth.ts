import AppError from './AppError';

export const checkUserExist = (user: any) => {
  if (user) throw new AppError('User already exist', 400);
};

export const checkUserNotExist = (user: any) => {
  if (!user) throw new AppError('User does not exist', 400);
};

export const checkAccountStatus = (status: string) => {
  if (status === 'FREEZE') {
    throw new AppError(
      'Your account is temporarily locked.Please contact our support team.',
      401
    );
  }
};
