import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Upload,
  MapPin,
  Camera,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Edit,
} from "lucide-react"; // Added Edit icon
import { supabase } from "../../lib/supabase";

interface SubmitIntelProps {
  location?: { lat: number; long: number; name?: string }; // Now optional
  editingAsset?: any; // New prop for edit mode
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubmitIntelModal({
  location,
  editingAsset,
  onClose,
  onSuccess,
}: SubmitIntelProps) {
  const [uploading, setUploading] = useState(false);

  // 1. DETERMINE ACTIVE LOCATION (Fixes the crash)
  // If editing, pull coordinates from the asset. If creating, pull from the map click.
  const activeLocation = editingAsset
    ? {
        lat: editingAsset.lat,
        long: editingAsset.long,
        name: editingAsset.location_name,
      }
    : location;

  // Safety Gate: If we somehow have neither, abort render to prevent crash
  if (!activeLocation) return null;

  // FORM STATE
  const [formData, setFormData] = useState({
    price: "",
    currency: "GHS",
    listing_type: "rent",
    description: "",
    location_hint: activeLocation.name || "", // Use derived location
  });

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Store existing images separately (so we don't re-upload them)
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2. PRE-POPULATE DATA IF EDITING
  useEffect(() => {
    if (editingAsset) {
      setFormData({
        price: editingAsset.price?.toString() || "",
        currency: editingAsset.currency || "GHS",
        listing_type: editingAsset.type || "rent",
        description: editingAsset.description || "",
        location_hint: editingAsset.location_name || "",
      });

      if (editingAsset.image_urls && Array.isArray(editingAsset.image_urls)) {
        setExistingImages(editingAsset.image_urls);
      }
    }
  }, [editingAsset]);

  // HANDLERS
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);

      // Generate Previews
      const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleSubmit = async () => {
    if (!formData.price) {
      alert("Please enter a price/valuation.");
      return;
    }

    setUploading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Authentication required.");
        setUploading(false);
        return;
      }

      // 1. Upload NEW Images to Supabase Storage
      const newFileUrls: string[] = [];

      if (files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${user.id}/${Date.now()}-${Math.random()
            .toString(36)
            .substring(7)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("properties")
            .upload(fileName, file);

          if (uploadError)
            throw new Error(
              "Failed to upload image. Does 'properties' bucket exist?"
            );

          const { data: publicData } = supabase.storage
            .from("properties")
            .getPublicUrl(fileName);

          newFileUrls.push(publicData.publicUrl);
        }
      }

      // Combine old and new images
      const finalImageUrls = [...existingImages, ...newFileUrls];

      // 2. Prepare Payload
      const payload = {
        price: parseFloat(formData.price.replace(/,/g, "")),
        currency: formData.currency,
        type: formData.listing_type,
        description: formData.description,
        location_name: formData.location_hint,
        lat: activeLocation.lat,
        long: activeLocation.long,
        status: "active",
        image_urls: finalImageUrls,
        cover_image_url: finalImageUrls[0] || null,
        // If editing, update 'updated_at', else 'created_at' is handled by DB default
        updated_at: new Date().toISOString(),
      };

      if (editingAsset) {
        // --- UPDATE EXISTING ASSET ---
        const { error: updateError } = await supabase
          .from("properties")
          .update(payload)
          .eq("id", editingAsset.id)
          .eq("owner_id", user.id); // Security check

        if (updateError) throw updateError;
      } else {
        // --- INSERT NEW ASSET ---
        const { error: insertError } = await supabase
          .from("properties")
          .insert({
            ...payload,
            owner_id: user.id,
            title: `${
              formData.listing_type === "rent" ? "For Rent" : "For Sale"
            } in ${formData.location_hint || "Accra"}`,
            source: "manual_entry",
            location_accuracy: "high",
            created_at: new Date().toISOString(),
          });

        if (insertError) throw insertError;
      }

      setTimeout(() => {
        setUploading(false);
        onSuccess();
        onClose();
      }, 500);
    } catch (error: any) {
      console.error("Operation Failed", error);
      alert(`Error: ${error.message || "Check console"}`);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* HEADER */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div>
            <h3 className="text-white font-bold flex items-center gap-2">
              {editingAsset ? (
                <Edit size={18} className="text-purple-500" />
              ) : (
                <Camera size={18} className="text-emerald-500" />
              )}
              {editingAsset ? "Edit Asset Protocol" : "List New Property"}
            </h3>
            <p className="text-[10px] text-gray-500 font-mono">
              GPS: {activeLocation.lat.toFixed(5)},{" "}
              {activeLocation.long.toFixed(5)}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          {/* TYPE & PRICE */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                Listing Type
              </label>
              <div className="flex bg-black border border-white/10 rounded-lg p-1">
                {["rent", "sale"].map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setFormData({ ...formData, listing_type: type })
                    }
                    className={`flex-1 py-2 text-xs font-bold uppercase rounded transition-all ${
                      formData.listing_type === type
                        ? "bg-emerald-600 text-white shadow-lg"
                        : "text-gray-500 hover:text-white"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                Price / Valuation
              </label>
              <div className="relative">
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className="absolute left-1 top-1 bottom-1 w-16 bg-white/5 border-none text-xs text-white rounded focus:outline-none text-center font-bold"
                >
                  <option value="GHS">GHS</option>
                  <option value="USD">USD</option>
                </select>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full bg-black border border-white/10 rounded-lg py-2.5 pl-20 pr-4 text-white text-sm font-mono focus:border-emerald-500/50 focus:outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* LOCATION */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">
              Property Location (Landmark/Area)
            </label>
            <div className="relative">
              <MapPin
                size={14}
                className="absolute left-3 top-3 text-gray-500"
              />
              <input
                type="text"
                value={formData.location_hint}
                onChange={(e) =>
                  setFormData({ ...formData, location_hint: e.target.value })
                }
                placeholder="e.g. Near the Shell Station, East Legon"
                className="w-full bg-black border border-white/10 rounded-lg py-2.5 pl-9 pr-4 text-white text-xs focus:border-emerald-500/50 focus:outline-none"
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">
              Property Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe the property, amenities, and condition..."
              className="w-full h-24 bg-black border border-white/10 rounded-lg p-3 text-white text-xs resize-none focus:border-emerald-500/50 focus:outline-none"
            />
          </div>

          {/* FILE UPLOAD */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">
              Property Photos
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-white/20 bg-white/5 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors group"
            >
              <Upload
                size={24}
                className="text-gray-500 group-hover:text-emerald-400 mb-2 transition-colors"
              />
              <span className="text-xs text-gray-400">
                Click to upload images
              </span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {/* Existing Images (Edit Mode) */}
            {existingImages.length > 0 && (
              <div className="mt-4">
                <p className="text-[9px] text-gray-500 mb-2 font-bold uppercase">
                  Current Images
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {existingImages.map((src, i) => (
                    <div
                      key={`exist-${i}`}
                      className="w-16 h-16 rounded border border-white/10 flex-shrink-0 overflow-hidden relative group"
                    >
                      <img
                        src={src}
                        alt="Existing"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() =>
                          setExistingImages((prev) =>
                            prev.filter((_, idx) => idx !== i)
                          )
                        }
                        className="absolute inset-0 bg-red-900/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Previews */}
            {previews.length > 0 && (
              <div className="mt-4">
                <p className="text-[9px] text-emerald-500 mb-2 font-bold uppercase">
                  New Uploads
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {previews.map((src, i) => (
                    <div
                      key={i}
                      className="w-16 h-16 rounded border border-emerald-500/30 flex-shrink-0 overflow-hidden relative group"
                    >
                      <img
                        src={src}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          setPreviews((prev) =>
                            prev.filter((_, idx) => idx !== i)
                          );
                          setFiles((prev) =>
                            prev.filter((_, idx) => idx !== i)
                          );
                        }}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-white/10 bg-black/40">
          <button
            onClick={handleSubmit}
            disabled={uploading || !formData.price}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
          >
            {uploading ? (
              <span className="flex items-center gap-2 text-xs uppercase animate-pulse">
                <Loader2 size={14} className="animate-spin" />{" "}
                {editingAsset ? "Updating..." : "Publishing..."}
              </span>
            ) : (
              <>
                {editingAsset ? "Update Asset" : "Publish Asset"}
                <CheckCircle2 size={16} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
