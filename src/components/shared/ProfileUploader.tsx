// ProfileUploader.tsx
import { convertFileToUrl } from "@/lib/utils";
import { useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";

type IUploader = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string;
};

const ProfileUploader = ({ fieldChange, mediaUrl }: IUploader) => {
  const [fileUrl, setFileUrl] = useState<string>(mediaUrl);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      fieldChange(acceptedFiles);
      setFileUrl(convertFileToUrl(acceptedFiles[0]));
    },
    [fieldChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg"] },
  });

  return (
    <div {...getRootProps()} className="cursor-pointer">
      <input {...getInputProps()} type="file" />
      <div className="flex-center gap-4">
        <img
          className="w-24 h-24 rounded-full object-cover object-top"
          src={fileUrl || "/assets/icons/profile-placeholder.svg"}
          alt="Profile image"
        />
        <p className="text-primary-500 small-regular md:base-semibold">
          Change profile photo
        </p>
      </div>
    </div>
  );
};

export default ProfileUploader;
