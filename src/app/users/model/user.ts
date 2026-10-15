export type User = {
  id: number;
  email: string;
  name: string;
  createdAt: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
};
