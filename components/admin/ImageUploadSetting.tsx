"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadSettingProps {
  name: string;
  label: string;
  defaultValue: string;
}

export function ImageUploadSetting({ name, label, defaultValue }: ImageUploadSettingProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="space-y-2 border border-slate-100 rounded-xl p-4 bg-slate-50/50">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </label>
        {value && !value.match(/\.(jpeg|jpg|gif|png|ico|svg|webp)/i) && value.startsWith("http") && (
          <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
            Custom Link
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <input
          type="url"
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://example.com/image.png or upload below"
          className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
        />
        
        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "default_preset"}
          onSuccess={(result: any) => {
            if (result.info?.secure_url) {
              setValue(result.info.secure_url);
            }
          }}
        >
          {({ open }) => (
            <div className="flex items-center gap-4">
              {value && (value.startsWith("http") || value.startsWith("/")) ? (
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 group bg-white shrink-0">
                  <img src={value} alt={label} className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setValue("")}
                      className="p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
              )}
              <button
                type="button"
                onClick={() => open?.()}
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 h-10 px-4 rounded-xl transition-all shadow-sm text-xs font-medium"
              >
                <Upload className="w-4 h-4 text-slate-500" />
                Upload via Cloudinary
              </button>
            </div>
          )}
        </CldUploadWidget>
      </div>
    </div>
  );
}
