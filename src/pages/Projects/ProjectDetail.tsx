import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  Download,
  FileText,
  Loader2,
  Send,
  Upload,
  User,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { projects, statusStyles, type ProjectDoc, type ProjectMessage } from "./data";

const docCategories = ["Financial", "Statutory", "KYC", "Contract", "Correspondence", "Other"];

export default function ProjectDetail() {
  const { id } = useParams();
  const project = projects.find((p) => p.id === id);
  const { toast } = useToast();

  const [docs, setDocs] = useState<ProjectDoc[]>(project?.documents ?? []);
  const [messages, setMessages] = useState<ProjectMessage[]>(project?.messages ?? []);
  const [draft, setDraft] = useState("");
  const [category, setCategory] = useState("Financial");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!project) {
    return (
      <PortalLayout title="Project" subtitle="Not found">
        <Card>
          <CardContent className="p-10 text-center space-y-3">
            <p className="text-sm text-muted-foreground">This project could not be found.</p>
            <Button asChild size="sm">
              <Link to="/projects">Back to projects</Link>
            </Button>
          </CardContent>
        </Card>
      </PortalLayout>
    );
  }

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const added: ProjectDoc[] = Array.from(files).map((f, i) => ({
      id: `${Date.now()}-${i}`,
      name: f.name,
      category,
      uploadedBy: "You",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      size: `${Math.max(1, Math.round(f.size / 1024))} KB`,
    }));
    setTimeout(() => {
      setDocs((d) => [...added, ...d]);
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
      toast({ title: "Document added", description: `${added.length} file(s) added to ${project.name}.` });
    }, 700);
  };

  const sendMessage = () => {
    if (!draft.trim()) return;
    setMessages((m) => [
      ...m,
      {
        id: `${Date.now()}`,
        from: "You",
        self: true,
        text: draft.trim(),
        time: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setDraft("");
  };

  return (
    <PortalLayout title={project.name} subtitle={`${project.reference} · Managed by ${project.manager}`}>
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground -ml-2">
          <Link to="/projects">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> All projects
          </Link>
        </Button>

        <Card className="animate-fade-in">
          <CardContent className="p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="text-sm text-muted-foreground max-w-2xl">{project.description}</p>
              <Badge variant="outline" className={statusStyles[project.status]}>
                {project.status}
              </Badge>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Overall progress</span>
                <span className="font-medium text-foreground">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> {project.manager}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> {project.startDate} — {project.dueDate}
              </span>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents ({docs.length})</TabsTrigger>
            <TabsTrigger value="communications">Communications ({messages.length})</TabsTrigger>
          </TabsList>

          {/* ── Overview: milestones + activity ── */}
          <TabsContent value="overview" className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-heading">Milestones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.milestones.map((m, i) => (
                  <div key={m.name} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      {m.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : m.status === "in_progress" ? (
                        <Clock className="h-4 w-4 text-warning" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                      {i < project.milestones.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.status === "completed" ? "Completed" : m.status === "in_progress" ? "Target" : "Planned"} ·{" "}
                        {m.date}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-heading">Recent activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.activity.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 text-sm">
                    <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                      {a.actor.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-foreground">
                        <span className="font-medium">{a.actor}</span> {a.text}
                      </p>
                      <p className="text-xs text-muted-foreground">{a.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Documents ── */}
          <TabsContent value="documents" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-heading">Add documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {docCategories.map((c) => (
                        <SelectItem key={c} value={c} className="text-xs">
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    ref={fileRef}
                    type="file"
                    multiple
                    disabled={uploading}
                    onChange={(e) => handleFiles(e.target.files)}
                    className="cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  {uploading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
                    </>
                  ) : (
                    <>
                      <Upload className="h-3 w-3" /> PDF, image or Office files. Files are shared with your project team.
                    </>
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0 divide-y">
                {docs.length === 0 && (
                  <p className="p-8 text-center text-sm text-muted-foreground">No documents on this project yet.</p>
                )}
                {docs.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 p-4">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{d.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.category} · {d.uploadedBy} · {d.date} · {d.size}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Communications ── */}
          <TabsContent value="communications" className="mt-4">
            <Card className="flex flex-col h-[32rem]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-heading">Project conversation</CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="flex-1 overflow-auto space-y-4 p-4">
                {messages.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    No messages yet — start the conversation with your project team.
                  </p>
                )}
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.self ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-xl px-3.5 py-2.5 ${
                        m.self ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      {!m.self && <p className="text-[10px] font-semibold opacity-70 mb-0.5">{m.from}</p>}
                      <p className="text-sm">{m.text}</p>
                      <p className={`text-[10px] mt-1 ${m.self ? "opacity-70" : "text-muted-foreground"}`}>{m.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
              <Separator />
              <div className="p-3 flex items-center gap-2">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Write a reply…"
                  className="h-9 text-sm"
                />
                <Button size="icon" className="h-9 w-9 shrink-0" onClick={sendMessage} disabled={!draft.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  );
}
