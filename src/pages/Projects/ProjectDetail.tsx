import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  MessageSquare,
  Send,
  Upload,
  User,
} from "lucide-react";
import {
  fetchProject,
  stageStyles,
  fetchMessages,
  sendMessage,
  fetchDocuments,
  uploadDocument,
} from "@/lib/projects-api";

export default function ProjectDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [draft, setDraft] = useState("");

  const {
    data: project,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["clientProject", id],
    queryFn: () => fetchProject(id as string),
    enabled: !!id,
    retry: false,
  });
  const { data: messages = [] } = useQuery({
    queryKey: ["clientProjectMessages", id],
    queryFn: () => fetchMessages(id as string),
    enabled: !!id,
  });
  const { data: docs = [] } = useQuery({
    queryKey: ["clientProjectDocuments", id],
    queryFn: () => fetchDocuments(id as string),
    enabled: !!id,
  });

  const sendMut = useMutation({
    mutationFn: () =>
      sendMessage(id as string, project?.clientName ?? "You", draft.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["clientProjectMessages", id],
      });
      setDraft("");
    },
    onError: (err: any) =>
      toast({
        title: "Failed to send",
        description: err?.response?.data?.message,
        variant: "destructive",
      }),
  });

  const uploadMut = useMutation({
    mutationFn: (file: File) => uploadDocument(id as string, file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["clientProjectDocuments", id],
      });
      if (fileRef.current) fileRef.current.value = "";
      toast({
        title: "Document added",
        description: "Your team will be notified.",
      });
    },
    onError: (err: any) =>
      toast({
        title: "Upload failed",
        description: err?.response?.data?.message,
        variant: "destructive",
      }),
    onSettled: () => setUploading(false),
  });

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    uploadMut.mutate(file);
  };

  if (isLoading) {
    return (
      <PortalLayout title="Project" subtitle="Loading…">
        <p className="py-16 text-center text-sm text-muted-foreground">
          Loading…
        </p>
      </PortalLayout>
    );
  }

  if (isError || !project) {
    return (
      <PortalLayout title="Project" subtitle="Not found">
        <Card>
          <CardContent className="space-y-3 p-10 text-center">
            <p className="text-sm text-muted-foreground">
              This project could not be found.
            </p>
            <Button asChild size="sm">
              <Link to="/projects">Back to projects</Link>
            </Button>
          </CardContent>
        </Card>
      </PortalLayout>
    );
  }

  // Derived from real messages + real document uploads — not a full
  // audit trail, but genuinely real data rather than a fabricated
  // feed, same approach used on the tenant and employee sides.
  const activity = [
    ...messages.map((m) => ({
      at: m.createdAt,
      actor: m.author,
      text: m.direction === "client" ? "sent a message" : "replied",
    })),
    ...docs.map((d) => ({
      at: d.createdAt,
      actor: d.uploadedBy,
      text: `uploaded ${d.name}`,
    })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <PortalLayout
      title={project.name}
      subtitle={`${project.ref}${project.manager ? ` · Managed by ${project.manager}` : ""}`}
    >
      <div className="space-y-6">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground"
        >
          <Link to="/projects">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> All projects
          </Link>
        </Button>

        <Card className="animate-fade-in">
          <CardContent className="space-y-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="max-w-2xl text-sm text-muted-foreground">
                {project.description || "No description yet."}
              </p>
              <Badge variant="outline" className={stageStyles[project.stage]}>
                {project.stage}
              </Badge>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Overall progress</span>
                <span className="font-medium text-foreground">
                  {project.progress}%
                </span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              {project.manager && (
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> {project.manager}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />{" "}
                {project.startDate?.slice(0, 10)} —{" "}
                {project.targetDate?.slice(0, 10)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">
              Documents ({docs.length})
            </TabsTrigger>
            <TabsTrigger value="communications">
              Communications ({messages.length})
            </TabsTrigger>
          </TabsList>

          {/* ── Overview: milestones + activity ── */}
          <TabsContent
            value="overview"
            className="mt-4 grid gap-4 lg:grid-cols-2"
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm">
                  Milestones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.milestones.map((m, i) => (
                  <div key={m._id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      {m.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : m.status === "in_progress" ? (
                        <Clock className="h-4 w-4 text-warning" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                      {i < project.milestones.length - 1 && (
                        <div className="mt-1 w-px flex-1 bg-border" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-foreground">
                        {m.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {m.status === "completed"
                          ? "Completed"
                          : m.status === "in_progress"
                            ? "In progress"
                            : "Planned"}{" "}
                        · {m.date?.slice(0, 10)}
                      </p>
                    </div>
                  </div>
                ))}
                {!project.milestones.length && (
                  <p className="text-sm text-muted-foreground">
                    No milestones set yet.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm">
                  Recent activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activity.slice(0, 8).map((a, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {a.actor.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-foreground">
                        <span className="font-medium">{a.actor}</span> {a.text}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(a.at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {!activity.length && (
                  <p className="text-sm text-muted-foreground">
                    No activity yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Documents ── */}
          <TabsContent value="documents" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm">
                  Add documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  ref={fileRef}
                  type="file"
                  disabled={uploading}
                  onChange={(e) => handleFiles(e.target.files)}
                  className="cursor-pointer file:mr-3 file:rounded file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary hover:file:bg-primary/20"
                />
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {uploading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
                    </>
                  ) : (
                    <>
                      <Upload className="h-3 w-3" /> Files are shared with your
                      project team.
                    </>
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="divide-y p-0">
                {!docs.length && (
                  <p className="p-8 text-center text-sm text-muted-foreground">
                    No documents on this project yet.
                  </p>
                )}
                {docs.map((d) => (
                  <div key={d._id} className="flex items-center gap-3 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {d.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {d.uploadedBy} · {d.createdAt?.slice(0, 10)} ·{" "}
                        {(d.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground"
                    >
                      <a href={d.fileUrl} target="_blank" rel="noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Communications ── */}
          <TabsContent value="communications" className="mt-4">
            <Card className="flex h-[32rem] flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm">
                  Project conversation
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="flex-1 space-y-4 overflow-auto p-4">
                {messages.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No messages yet — start the conversation with your project
                    team.
                  </p>
                )}
                {messages.map((m) => (
                  <div
                    key={m._id}
                    className={`flex ${m.direction === "client" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-xl px-3.5 py-2.5 ${
                        m.direction === "client"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {m.direction !== "client" && (
                        <p className="mb-0.5 text-[10px] font-semibold opacity-70">
                          {m.author}
                        </p>
                      )}
                      <p className="text-sm">{m.body}</p>
                      <p
                        className={`mt-1 text-[10px] ${m.direction === "client" ? "opacity-70" : "text-muted-foreground"}`}
                      >
                        {new Date(m.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
              <Separator />
              <div className="flex items-center gap-2 p-3">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && draft.trim() && sendMut.mutate()
                  }
                  placeholder="Write a reply…"
                  className="h-9 text-sm"
                />
                <Button
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => sendMut.mutate()}
                  disabled={!draft.trim() || sendMut.isPending}
                >
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
