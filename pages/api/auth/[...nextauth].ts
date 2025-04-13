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
        customToken.googleId = profile?.sub;
        
        try {
          // Exchange Google token for backend token
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/google/callback`,
            {
              access_token: account.access_token,
              id_token: account.id_token,
              googleId: profile?.sub
            }
          );

          if (response.data?.token) {
            customToken.backendToken = response.data.token;
            customToken.userId = response.data.userId;
            customToken.isOwner = response.data.isOwner;
          }
        } catch (error) {
          console.error('Error exchanging tokens:', error);
        }
        return customToken;
      }
      return token;
    },
    async session({ session, token }) {
      const customToken = token as CustomToken;
      
      // Add token data to session
      session.accessToken = customToken.accessToken;
      session.googleId = customToken.googleId;
      session.backendToken = customToken.backendToken;
      session.userId = customToken.userId;
      session.isOwner = customToken.isOwner;
      
      // Also add these to the user object for convenience
      session.user.accessToken = customToken.accessToken;
      session.user.googleId = customToken.googleId;
      session.user.backendToken = customToken.backendToken;
      session.user.userId = customToken.userId;
      session.user.isOwner = customToken.isOwner;
      
      return session;
    }
  },
  pages: {
    signIn: '/',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
}); 