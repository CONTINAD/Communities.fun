"use client";

import { useRef, useState } from "react";
import { updateProfile } from "@/actions/profile";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import ImageUpload from "@/components/ui/ImageUpload";

interface ProfileEditFormProps {
  user: {
    name: string | null;
    username: string;
    bio: string | null;
    avatar: string | null;
    coverImage: string | null;
  };
  onClose: () => void;
}

export default function ProfileEditForm({
  user,
  onClose,
}: ProfileEditFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!formRef.current) return;
    setSaving(true);
    try {
      const formData = new FormData(formRef.current);
      await updateProfile(formData);
      onClose();
    } catch {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Edit profile">
      <div className="absolute right-4 top-3">
        <Button
          size="sm"
          onClick={handleSave}
          loading={saving}
          disabled={saving}
        >
          Save
        </Button>
      </div>

      <form ref={formRef} className="space-y-5 px-4 pb-6 pt-2">
        {/* Name */}
        <div>
          <label
            htmlFor="edit-name"
            className="mb-1 block text-sm text-text-secondary"
          >
            Name
          </label>
          <input
            id="edit-name"
            name="name"
            type="text"
            defaultValue={user.name || ""}
            maxLength={50}
            className="w-full rounded-md border border-border-primary bg-transparent px-3 py-2 text-text-primary outline-none transition-colors focus:border-accent"
          />
        </div>

        {/* Bio */}
        <div>
          <label
            htmlFor="edit-bio"
            className="mb-1 block text-sm text-text-secondary"
          >
            Bio
          </label>
          <textarea
            id="edit-bio"
            name="bio"
            defaultValue={user.bio || ""}
            rows={3}
            maxLength={160}
            className="w-full resize-none rounded-md border border-border-primary bg-transparent px-3 py-2 text-text-primary outline-none transition-colors focus:border-accent"
          />
        </div>

        {/* Avatar upload */}
        <ImageUpload
          name="avatar"
          label="Avatar"
          currentImage={user.avatar}
          shape="circle"
        />

        {/* Cover image upload */}
        <ImageUpload
          name="coverImage"
          label="Cover Image"
          currentImage={user.coverImage}
          shape="banner"
        />
      </form>
    </Modal>
  );
}
