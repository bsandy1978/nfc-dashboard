import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';
import { JWT } from 'next-auth/jwt';

// Define custom token type
interface CustomToken extends JWT {
  accessToken?: string;
  googleId?: string;
  backendToken?: string;
  userId?: string;
  isOwner?: boolean;
  isAdmin?: boolean;
}

// Get session max age from environment variable or default to 24 hours
const sessionMaxAge = parseInt(process.env.SESSION_MAX_AGE || '86400', 10);

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: sessionMaxAge, // Use environment variable
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        const customToken = token as CustomToken;
        customToken.accessToken = account.access_token;
        customToken.googleId = account.providerAccountId;
        
        try {
          // Get user data from your backend
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
            accessToken: account.access_token,
            googleId: account.providerAccountId,
            email: profile?.email,
            name: profile?.name,
            image: profile?.image,
          });

          if (response.data) {
            customToken.backendToken = response.data.token;
            customToken.userId = response.data.userId;
            customToken.isOwner = response.data.isOwner;
            customToken.isAdmin = response.data.isAdmin;
          }
        } catch (error) {
          console.error('Error getting user data:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      const customToken = token as CustomToken;
      if (session.user) {
        session.user.accessToken = customToken.accessToken;
        session.user.googleId = customToken.googleId;
        session.user.backendToken = customToken.backendToken;
        session.user.userId = customToken.userId;
        session.user.isOwner = customToken.isOwner;
        session.user.isAdmin = customToken.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
}); 