import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';

// Get session max age from environment variable or default to 24 hours
const sessionMaxAge = parseInt(process.env.SESSION_MAX_AGE || '86400', 10);

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
        token.accessToken = account.access_token;
        token.googleId = account.providerAccountId;
        
        try {
          // Get user data from your backend
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google`,
            {
              token: account.id_token
            }
          );

          if (response.data) {
            token.backendToken = response.data.token;
            token.userId = response.data.userId;
            token.isOwner = response.data.isOwner;
            token.isAdmin = response.data.isAdmin;
          }
        } catch (error) {
          console.error('Error getting user data:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.accessToken = token.accessToken;
        session.user.googleId = token.googleId;
        session.user.backendToken = token.backendToken;
        session.user.userId = token.userId;
        session.user.isOwner = token.isOwner;
        session.user.isAdmin = token.isAdmin;
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