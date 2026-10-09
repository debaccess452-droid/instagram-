import { mockCreatorDNA } from "../data/mockCreatorDNA";

export const creatorDNAService = {
  getProfile: async () => mockCreatorDNA,
  saveSample: async (text) => ({ success: true, length: text.length }),
};

export default creatorDNAService;
