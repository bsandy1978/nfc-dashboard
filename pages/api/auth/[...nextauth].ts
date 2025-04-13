import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.googleId = account.providerAccountId;
        
        // Verify token with our backend
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/google/verify`,
            { token: account.id_token }
          );
          
          if (response.data.success) {
            token.backendToken = response.data.token;
            token.userId = response.data.user.id;
            token.isOwner = response.data.user.isOwner;
          }
        } catch (error) {
          console.error('Error verifying token with backend:', error);
        }
      }
      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      session.accessToken = token.accessToken;
      session.googleId = token.googleId;
      session.backendToken = token.backendToken;
      session.userId = token.userId;
      session.isOwner = token.isOwner;
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/', // Error code passed in query string as ?error=
  },
  secret: process.env.NEXTAUTH_SECRET,
}); 