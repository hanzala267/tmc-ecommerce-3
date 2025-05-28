"use client";

import { useId, useState } from "react";
import { type Tag, TagInput } from "emblor";
import { Label } from "@/components/ui/label";

interface TagInputComponentProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
  id?: string;
}

export function TagInputComponent({
  value,
  onChange,
  placeholder = "Add a tag",
  label = "Tags",
  id,
}: TagInputComponentProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  // Convert string array to Tag array
  const tags: Tag[] = value.map((text, index) => ({
    id: index.toString(),
    text: text,
  }));

  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  const handleTagsChange = (newTags: Tag[]) => {
    // Convert Tag array back to string array
    const stringTags = newTags.map((tag) => tag.text);
    onChange(stringTags);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <TagInput
        id={inputId}
        tags={tags}
        setTags={handleTagsChange}
        placeholder={placeholder}
        styleClasses={{
          tagList: {
            container: "gap-1",
          },
          input:
            "rounded-md transition-[color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-ring outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 border border-emerald-200",
          tag: {
            body: "relative h-7 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-md font-medium text-xs ps-2 pe-7 text-emerald-800",
            closeButton:
              "absolute -inset-y-px -end-px p-0 rounded-s-none rounded-e-md flex size-7 transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] text-emerald-600 hover:text-emerald-800 hover:bg-emerald-200",
          },
        }}
        activeTagIndex={activeTagIndex}
        setActiveTagIndex={setActiveTagIndex}
        inlineTags={false}
        inputFieldPosition="top"
      />
    </div>
  );
}
