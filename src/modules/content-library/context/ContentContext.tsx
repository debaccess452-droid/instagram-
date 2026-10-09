import React, { createContext, useContext, useState, type ReactNode } from "react";
import type { ContentItem } from "../types/content";
import { mockLibraryContent } from "../data/mockContent";

interface ContentContextValue {
  items: ContentItem[];
  addItem: (item: ContentItem) => void;
}

const ContentContext = createContext<ContentContextValue>({
  items: mockLibraryContent,
  addItem: () => {},
});

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ContentItem[]>(mockLibraryContent);

  const addItem = (item: ContentItem) => {
    setItems((prev) => [item, ...prev]);
  };

  return (
    <ContentContext.Provider value={{ items, addItem }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContentContext = () => useContext(ContentContext);
export default ContentContext;
