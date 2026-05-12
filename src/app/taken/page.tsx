import { CheckCircle2, Circle, Loader2, Plus } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { leaderById, tasks } from "@/lib/mock-data";
import { formatRelativeDays } from "@/lib/utils";

const columns: { key: "todo" | "in_progress" | "done"; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "todo", label: "Te doen", icon: Circle },
  { key: "in_progress", label: "Bezig", icon: Loader2 },
  { key: "done", label: "Gedaan", icon: CheckCircle2 },
];

const priorityVariant = {
  high: "danger",
  medium: "warning",
  low: "muted",
} as const;

const priorityLabel = {
  high: "Hoog",
  medium: "Normaal",
  low: "Laag",
};

export default function TakenPage() {
  const today = new Date("2026-05-12");
  return (
    <>
      <Topbar title="Werkzaamheden" subtitle="Alles wat het team voor elkaar moet krijgen" />
      <div className="p-4 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            {tasks.filter((t) => t.status !== "done").length} open · {tasks.filter((t) => t.status === "done").length} voltooid
          </div>
          <Button>
            <Plus className="h-4 w-4" />
            Nieuwe taak
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {columns.map((col) => {
            const list = tasks.filter((t) => t.status === col.key);
            const Icon = col.icon;
            return (
              <div key={col.key} className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Icon className={`h-4 w-4 ${col.key === "in_progress" ? "text-accent" : col.key === "done" ? "text-green-700" : "text-muted-foreground"}`} />
                  <h3 className="text-sm font-semibold">{col.label}</h3>
                  <Badge variant="muted">{list.length}</Badge>
                </div>
                <div className="space-y-2">
                  {list.map((t) => {
                    const lead = leaderById(t.assigneeId);
                    const isDone = t.status === "done";
                    return (
                      <Card key={t.id} className={isDone ? "opacity-70" : ""}>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start gap-2">
                            <button className="mt-0.5 shrink-0" aria-label="Toggle status">
                              {isDone ? (
                                <CheckCircle2 className="h-4 w-4 text-green-700" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                            <div className="min-w-0 flex-1">
                              <div className={`text-sm font-medium leading-snug ${isDone ? "line-through text-muted-foreground" : ""}`}>
                                {t.title}
                              </div>
                              {t.description && (
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-2 pl-6">
                            <div className="flex items-center gap-1.5">
                              <Avatar name={lead.name} color={lead.color} size={20} />
                              <span className="text-xs text-muted-foreground">{lead.name.split(" ")[0]}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Badge variant={priorityVariant[t.priority]} className="text-[10px]">
                                {priorityLabel[t.priority]}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeDays(new Date(t.dueDate), new Date(today))}
                              </span>
                            </div>
                          </div>
                          <div className="pl-6">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                              {t.category}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
