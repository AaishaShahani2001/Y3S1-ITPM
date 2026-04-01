import React from "react";

export default function ConfirmationModel({
    isOpen,
    title = "Confirm Action",
    message = "Are you sure?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    danger = false,
    children,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-1100 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6">
                <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-600 mb-4">{message}</p>
                {children}
                <div className="mb-6" />
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl text-white ${
                            danger ? "bg-red-600 hover:bg-red-700" : "bg-slate-900 hover:bg-black"
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
