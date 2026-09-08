import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useDispatch, useSelector } from "react-redux";
import { Upload, Loader2 } from "lucide-react";
import clsx from "clsx";
import { uploadImage } from "../analysisSlice";

const ACCEPT = {
  "image/png": [".png"],
  "application/dicom": [".dcm"],
  "image/tiff": [".tiff", ".tif"],
  "application/nifti": [".nii", ".nii.gz"],
};

export default function UploadZone() {
  const dispatch = useDispatch();
  const { uploadStatus } = useSelector((state) => state.analysis);
  const isLoading = uploadStatus === "loading";

  const onDrop = useCallback(
    (files) => {
      if (files.length > 0) dispatch(uploadImage(files[0]));
    },
    [dispatch]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    multiple: false,
    disabled: isLoading,
  });

  return (
    <div
      {...getRootProps()}
      className={clsx(
        "relative flex flex-col items-center justify-center rounded-card border-2 border-dashed p-10 transition-all cursor-pointer",
        isLoading && "opacity-60 cursor-wait",
        isDragActive
          ? "border-accent-purple bg-accent-purple-soft/40"
          : "border-gray-300 bg-surface hover:border-accent-purple/50 hover:bg-accent-purple-soft/20"
      )}
    >
      <input {...getInputProps()} />

      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-purple-soft">
        {isLoading ? (
          <Loader2 size={24} className="text-accent-purple animate-spin" />
        ) : (
          <Upload size={24} className="text-accent-purple" />
        )}
      </div>

      {isLoading ? (
        <p className="text-sm font-medium text-text-secondary">
          Uploading &amp; analyzing…
        </p>
      ) : isDragActive ? (
        <p className="text-sm font-medium text-accent-purple">
          Drop your file here
        </p>
      ) : (
        <>
          <p className="text-sm font-medium text-text-primary">
            Drag &amp; drop your diagnostic image
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            PNG, DICOM, TIFF, or NIfTI — or click to browse
          </p>
        </>
      )}
    </div>
  );
}
