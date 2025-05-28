"use client";

import { useState, useEffect } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
}: ImageUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<number>(0);
  const [images, setImages] = useState<string[]>([]);

  // Initialize images from value prop
  useEffect(() => {
    setImages(value || []);
  }, [value]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const currentImageCount = images.length;
    const newFilesCount = files.length;

    if (currentImageCount + newFilesCount > maxImages) {
      toast({
        title: "Too many images",
        description: `Maximum ${maxImages} images allowed. You can upload ${
          maxImages - currentImageCount
        } more.`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadingFiles(newFilesCount);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast({
            title: "Invalid file type",
            description: `File "${file.name}" is not an image. Please upload only image files.`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `File "${file.name}" is larger than 5MB. Please choose a smaller image.`,
            variant: "destructive",
          });
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            uploadedUrls.push(data.url);
          } else {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to upload ${file.name}`);
          }
        } catch (uploadError) {
          console.error(`Error uploading ${file.name}:`, uploadError);
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}. Please try again.`,
            variant: "destructive",
          });
        }
      }

      if (uploadedUrls.length > 0) {
        const newImages = [...images, ...uploadedUrls];
        setImages(newImages);
        onChange(newImages);

        toast({
          title: "Success",
          description: `${uploadedUrls.length} image(s) uploaded successfully`,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadingFiles(0);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onChange(newImages);

    toast({
      title: "Image removed",
      description: "Image has been removed successfully",
    });
  };

  const canUploadMore = images.length < maxImages && !isUploading;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Product Images</label>
        <span className="text-xs text-gray-500">
          {images.length}/{maxImages} images
        </span>
      </div>

      {/* Current Images Display */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          {images.map((url, index) => (
            <div key={`image-${index}-${url}`} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-emerald-200">
                <Image
                  src={url || "/placeholder.svg"}
                  alt={`Product image ${index + 1}`}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Image failed to load:", url);
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                onClick={() => removeImage(index)}
                disabled={isUploading}
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canUploadMore && (
        <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6 bg-emerald-50/50">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            id="image-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="image-upload"
            className={`cursor-pointer flex flex-col items-center justify-center space-y-2 ${
              isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                <div className="text-center">
                  <p className="text-sm font-medium text-emerald-900">
                    Uploading {uploadingFiles} image(s)...
                  </p>
                  <p className="text-xs text-gray-500">
                    Please wait while we upload your images
                  </p>
                </div>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-emerald-600" />
                <div className="text-center">
                  <p className="text-sm font-medium text-emerald-900">
                    {images.length === 0
                      ? "Click to upload images"
                      : "Click to add more images"}
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, JPEG up to 5MB each • {maxImages - images.length}{" "}
                    more allowed
                  </p>
                </div>
              </>
            )}
          </label>
        </div>
      )}

      {/* No Images State */}
      {images.length === 0 && !isUploading && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No images uploaded yet</p>
          <p className="text-xs">Upload images to showcase your product</p>
        </div>
      )}

      {/* Max Images Reached */}
      {images.length >= maxImages && (
        <div className="text-center py-4 text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-200">
          <p className="text-sm font-medium">Maximum images reached</p>
          <p className="text-xs">Remove an image to upload a new one</p>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 text-emerald-600 animate-spin" />
            <span className="text-sm text-emerald-700">
              Uploading {uploadingFiles} image(s) to Cloudinary...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
