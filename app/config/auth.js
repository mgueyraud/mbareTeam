export default {
  providers: [
    {
      provide: 'AUTH_PROVIDER',
      useClass: AuthProvider,
      inject: ['$http', 'AuthService'],
      props: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
    },
  ],
};