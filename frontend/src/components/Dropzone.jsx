import { useRef, useState } from "react";
import Spinner from "./Spinner";

/**
 * Zip upload.
 *
 * The design says "Drop a folder or .zip here". This accepts a .zip only,
 * because `POST /datasets` takes a zip and building one in the browser needs a
 * compression library we have not added. The copy below says what actually
 * works rather than what we wish worked — a dropzone that silently ignores a
 * dropped folder is worse than one that never offered.
 *
 * Keyboard: the whole zone is a button, so Tab then Enter opens the picker.
 */
export default function Dropzone({ onFile, busy, disabled }) {
  const input = useRef(null);
  const [over, setOver] = useState(false);
  const [reject, setReject] = useState(null);

  const accept = (file) => {
    if (!file) return;
    if (!/\.zip$/i.test(file.name)) {
      setReject(`${file.name} is not a .zip. Compress the folder first.`);
      return;
    }
    setReject(null);
    onFile(file);
  };

  return (
    <div>
      <button
        type="button"
        disabled={busy || disabled}
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          accept(e.dataTransfer.files?.[0]);
        }}
        className={`flex w-full flex-col items-center justify-center gap-2
          rounded-[10px] border border-dashed px-6 py-12 transition-colors
          ${over ? "border-quantum bg-quantum-soft" : "border-quantum bg-white"}
          ${busy || disabled ? "cursor-not-allowed opacity-60" : "hover:bg-quantum-soft/50"}`}
      >
        <span className="grid h-12 w-12 place-items-center rounded-full bg-quantum-soft">
          {busy ? (
            <Spinner size={20} className="text-quantum" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 18V6M6 12l6-6 6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-quantum"
              />
            </svg>
          )}
        </span>
        <span className="text-[16px] font-semibold text-ink">
          {busy ? "Reading your images" : "Drop a .zip here"}
        </span>
        <span className="text-[11.5px] text-muted">
          {busy
            ? "Unzipping, grouping by folder, and rendering four previews"
            : "One folder per class inside the zip · up to 1000 images · JPG or PNG"}
        </span>
        {!busy && (
          <span className="mt-2 rounded-[7px] border border-rule px-3 py-1.5 text-[13px] text-body">
            Browse files
          </span>
        )}
      </button>

      <input
        ref={input}
        type="file"
        accept=".zip,application/zip"
        className="sr-only"
        onChange={(e) => accept(e.target.files?.[0])}
      />

      {reject && (
        <p role="alert" className="mt-2 text-[11.5px] text-alert">
          {reject}
        </p>
      )}
    </div>
  );
}
