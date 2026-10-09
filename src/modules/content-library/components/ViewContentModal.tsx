import React from "react";
import type { ContentItem } from "../types/content";
import { Modal } from "@/components/modal";

export const ViewContentModal: React.FC<{
  item: ContentItem | null;
  onClose: () => void;
}> = ({ item, onClose }) => {
  return (
    <Modal isOpen={Boolean(item)} onClose={onClose} title={item?.title}>
      {item && (
        <div className="space-y-3 text-sm text-text-secondary">
          <p className="text-xs font-semibold text-primary">
            {item.platform} · {item.type} · {item.dnaMatch}% DNA Match
          </p>
          <p className="text-text-primary leading-relaxed">{item.excerpt}</p>
        </div>
      )}
    </Modal>
  );
};

export default ViewContentModal;
