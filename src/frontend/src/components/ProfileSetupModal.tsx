import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, User } from "lucide-react";
import { useState } from "react";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

interface ProfileSetupModalProps {
  isOpen: boolean;
  onComplete: (name: string) => void;
}

export default function ProfileSetupModal({
  isOpen,
  onComplete,
}: ProfileSetupModalProps) {
  const [name, setName] = useState("");
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await saveProfile.mutateAsync({ name: name.trim() });
      onComplete(name.trim());
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="max-w-sm"
        data-ocid="profile_setup.dialog"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <User className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center">
            Welcome, Field Agent
          </DialogTitle>
          <DialogDescription className="text-center">
            Please enter your name to set up your profile for Madhav Solar
            Energy field operations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="agent-name">Your Name</Label>
            <Input
              id="agent-name"
              data-ocid="profile_setup.name.input"
              placeholder="e.g. Ramesh Patel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <Button
            data-ocid="profile_setup.submit_button"
            type="submit"
            disabled={!name.trim() || saveProfile.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Start Field Operations
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
