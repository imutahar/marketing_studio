"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<unknown>;
}

export function NewProjectModal({ open, onClose, onCreate }: NewProjectModalProps) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setName("");
    setError(null);
    onClose();
  }

  async function submit() {
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onCreate(name.trim());
      close();
    } catch {
      setError("تعذّر إنشاء المشروع.");
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      ariaLabel="مشروع جديد"
      title="مشروع جديد"
      subtitle="أنشئ مساحة عمل جديدة لمنتجك أو حملتك."
      widthClass="max-w-[440px]"
    >
      <div className="px-6 pb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="اسم المشروع (مثال: إطلاق عطر الصيف)"
          aria-label="اسم المشروع"
          autoFocus
          className="h-11 w-full rounded-xl border border-line bg-transparent px-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-line-hover"
        />
        {error && <p className="mt-2 text-xs text-danger">{error}</p>}
        <Button
          variant="primary"
          className="mt-4 w-full"
          onClick={submit}
          disabled={!name.trim() || busy}
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : "إنشاء المشروع"}
        </Button>
      </div>
    </Modal>
  );
}
