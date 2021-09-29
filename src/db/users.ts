import RedisClient from '../lib/redis';

type UpdatableUserFields = {
  meetingUrl?: string;
  name?: string;
  linkedInUrl?: string;
};

interface User extends UpdatableUserFields {
  userId: string;
}

export const setUser = async (user: User) => {
  return await RedisClient.set(user.userId, JSON.stringify(user));
};

export const getUser = async (userId: string) => {
  const stringifiedUser = await RedisClient.get(userId);
  if (!stringifiedUser) return null;

  return JSON.parse(stringifiedUser);
};

export const updateUser = async (
  userId: string,
  toUpdate: UpdatableUserFields
) => {
  const user = await getUser(userId);
  return await setUser({ ...user, ...toUpdate });
};
