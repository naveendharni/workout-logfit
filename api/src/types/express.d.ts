declare global {
  namespace Express {
    interface Request {
      // Set by requireAuth.
      userId?: string;
    }
  }
}

export {};
