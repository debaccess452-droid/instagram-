export const instagramService = {
  connectHandle: async (handle) => ({
    connected: true,
    handle,
    postsImported: 24,
  }),
};

export default instagramService;
