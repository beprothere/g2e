import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { createPortal } from "react-dom";

const ReawardsDeleteModal = ({
  onClose,
  onDelete,
  rewardName,
}: {
  onClose: () => void;
  onDelete: () => void;
  rewardName?: string;
}) => {
  const modalContent = (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-sm p-8 bg-card border-2 border-red-500/20 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-2xl font-bold">Are you sure?</h3>
          <p className="text-muted-foreground">
            Bhai, <span className="font-bold text-foreground">"{rewardName}"</span> delete ho jayega aur wapas nahi milay ga.
          </p>
          <div className="flex w-full gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border font-bold hover:bg-secondary transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </Card>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
};

export default ReawardsDeleteModal;