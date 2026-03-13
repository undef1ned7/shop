declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: { toString(): string };
        username: string;
        role: string;
        password: string;
        refreshToken?: string;
        favorites?: { toString(): string }[];
      };
    }
  }
}

export {};

