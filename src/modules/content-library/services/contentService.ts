import { mockLibraryContent } from "../data/mockContent";

export const contentService = {
  list: async () => mockLibraryContent,
};

export default contentService;
