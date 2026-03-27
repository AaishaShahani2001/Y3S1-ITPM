import React from "react";

export default function ApproveModel({
    isOpen,
    title = "Approve Cancellation",
    message = "Do you want to approve this cancellation request and release the slot?",
    confirmText = "Approve",
    cancelText = "Close",
    onConfirm,
    onCancel,
    note = "",
    studentName = "Student",
    loading = false,
    approved = false,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-1150 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 p-6">
                <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-600 mb-4">{message}</p>

                <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">
                        Cancellation Note From {studentName}
                    </p>
                    <p className="text-sm text-red-700 whitespace-pre-wrap">
                        {note || "No note provided."}
                    </p>
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading || approved}
                        className="px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {approved ? "Approved" : loading ? "Processing..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
