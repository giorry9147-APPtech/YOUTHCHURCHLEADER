import { Image as ImageIcon, MessageSquare, Paperclip, Pin, Send, Smile } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { currentUser, leaderById, messages } from "@/lib/mock-data";

export default function BerichtenPage() {
  const pinned = messages.filter((m) => m.pinned);
  const rest = messages.filter((m) => !m.pinned);

  return (
    <>
      <Topbar title="Berichtenbord" subtitle="Voor het hele team — iedereen kan meelezen" />
      <div className="p-4 md:p-8 space-y-6 max-w-3xl w-full mx-auto">
        {/* Composer */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Avatar name={currentUser.name} color={currentUser.color} size={40} />
              <div className="flex-1 min-h-[80px] rounded-xl border border-border bg-subtle p-3.5 text-sm text-muted-foreground">
                Deel iets met het team…
              </div>
            </div>
            <div className="flex items-center justify-between pl-[3.5rem]">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" aria-label="Bijlage">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Afbeelding">
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Emoji">
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
              <Button size="sm">
                Plaatsen
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {pinned.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-medium">
              <Pin className="h-3 w-3" /> Vastgepind
            </div>
            {pinned.map((m) => (
              <MessageCard key={m.id} m={m} />
            ))}
          </div>
        )}

        <div className="space-y-3">
          {rest.map((m) => (
            <MessageCard key={m.id} m={m} />
          ))}
        </div>
      </div>
    </>
  );
}

function MessageCard({ m }: { m: (typeof messages)[number] }) {
  const author = leaderById(m.authorId);
  const created = new Date(m.createdAt);
  return (
    <Card className={m.pinned ? "border-accent/30" : ""}>
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <Avatar name={author.name} color={author.color} size={40} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{author.name}</span>
              <span className="text-xs text-muted-foreground">{author.role}</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span className="text-xs text-muted-foreground">
                {created.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })} ·{" "}
                {created.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
              </span>
              {m.pinned && <Badge variant="accent" className="ml-1">Vastgepind</Badge>}
            </div>
            <p className="text-[15px] leading-relaxed mt-1.5 whitespace-pre-line">{m.content}</p>
            <div className="flex items-center gap-2 mt-3">
              {m.reactions.map((r, i) => (
                <button
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-muted hover:bg-muted/70 transition-colors border border-border px-2.5 py-1 text-xs"
                >
                  <span>{r.emoji}</span>
                  <span className="text-muted-foreground">{r.count}</span>
                </button>
              ))}
              <button className="inline-flex items-center gap-1 rounded-full hover:bg-muted transition-colors border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground">
                <Smile className="h-3 w-3" />
              </button>
              <button className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <MessageSquare className="h-3 w-3" />
                {m.comments} reacties
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
