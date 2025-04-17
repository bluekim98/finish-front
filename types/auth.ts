export type User = {
  email: string;
  name: string;
};

export type UserSession = {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiredTimestamp: number;
};
