import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    googleId?: string;
    backendToken?: string;
    userId?: string;
    isOwner?: boolean;
    isAdmin?: boolean;
    user: {
      email?: string;
      name?: string;
      image?: string;
      accessToken?: string;
      googleId?: string;
      backendToken?: string;
      userId?: string;
      isOwner?: boolean;
      isAdmin?: boolean;
    };
  }

  interface JWT {
    accessToken?: string;
    googleId?: string;
    backendToken?: string;
    userId?: string;
    isOwner?: boolean;
    isAdmin?: boolean;
  }
} 