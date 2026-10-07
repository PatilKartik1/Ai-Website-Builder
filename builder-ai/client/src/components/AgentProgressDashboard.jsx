import { CheckCircle2Icon, CircleIcon, Loader2Icon } from "lucide-react";

export default function AgentProgressDashboard({ project }) {
    const planned = project.filesPlanned || [];
    const completed = project.filesGenerated || [];
    const current = project.currentFile;
    const isFailed = project.status === "failed";

    return (
        <div className="h-full w-full bg-transparent flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
            <div className="max-w-xl w-full bg-[#090b10]/90 border border-white/15 rounded-2xl p-6 md:p-8 relative overflow-hidden backdrop-blur-2xl shadow-2xl shadow-black/50">
                {/* Status Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-base font-semibold text-white">
                            {isFailed
                                ? "Generation Failed"
                                : project.status === "pending"
                                  ? "Planning Architecture..."
                                  : "AI Agent is Building..."}
                        </h2>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            {isFailed ? "An error occurred during build" : "Writing production-ready React codebase"}
                        </p>
                    </div>
                </div>

                {isFailed && project.error && (
                    <div className="mb-6 p-4 bg-red-950/50 border border-red-500/30 rounded-lg text-sm text-red-300 font-medium">
                        Error: {project.error}
                    </div>
                )}

                {/* Progress bar */}
                {planned.length > 0 && !isFailed && (
                    <div className="mb-6">
                        <div className="flex justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                            <span>Progress</span>
                            <span className="text-amber-400">{Math.round((completed.length / planned.length) * 100)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 ease-out"
                                style={{ width: `${(completed.length / planned.length) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Files checklist */}
                {planned.length > 0 ? (
                    <div>
                        <span className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
                            Planned Files ({completed.length}/{planned.length})
                        </span>
                        <div className="space-y-2.5 max-h-75 overflow-y-auto pr-1">
                            {planned.map((file) => {
                                const isCompleted = completed.includes(file.path);
                                const isGenerating = current === file.path;

                                return (
                                    <div
                                        key={file.path}
                                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                                            isGenerating
                                                ? "bg-amber-500/15 border-amber-500/40 shadow-xs"
                                                : isCompleted
                                                  ? "bg-white/5 border-white/10"
                                                  : "bg-white/2 border-white/5 opacity-50"
                                        }`}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle2Icon size={16} className="text-emerald-400 shrink-0" />
                                        ) : isGenerating ? (
                                            <Loader2Icon size={16} className="animate-spin text-amber-400 shrink-0" />
                                        ) : (
                                            <CircleIcon size={16} className="text-zinc-600 shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className={`text-xs font-medium truncate ${isGenerating ? "text-amber-200" : isCompleted ? "text-zinc-200" : "text-zinc-400"}`}
                                            >
                                                {file.path}
                                            </p>
                                            <p className="text-[10px] text-zinc-500 truncate mt-0.5">{file.description}</p>
                                        </div>
                                        {isGenerating && (
                                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold animate-pulse uppercase tracking-wider">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    !isFailed && (
                        <div className="flex flex-col items-center justify-center py-6 text-zinc-400">
                            <Loader2Icon size={24} className="animate-spin mb-2 text-amber-400" />
                            <p className="text-xs">Analyzing requirements and designing project structure...</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
