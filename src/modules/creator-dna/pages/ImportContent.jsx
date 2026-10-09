import React from "react";
import { InstagramCard } from "../components/InstagramCard";
import { UploadArea } from "../components/UploadArea";

export const ImportContent = () => (
  <div className="space-y-4">
    <InstagramCard />
    <UploadArea />
  </div>
);

export default ImportContent;
