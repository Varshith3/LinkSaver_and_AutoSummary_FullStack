module.exports = {
    async redirects() {
      return [
        {
          source: '/',
          destination: '/signup',
          permanent: true, 
        },
      ];
    },
  };