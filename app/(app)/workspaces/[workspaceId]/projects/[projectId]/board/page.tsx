import BoardView from "@/components/board/board-view";
import IssueDrawer from "@/components/issue/issue-drawer";
import CreateIssueDialog from "@/components/issue/create-issue-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function BoardPage({ params }: { params: { workspaceId: string; projectId: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Project {params.projectId}</h1>
          <p className="text-sm text-slate-500">Sprint board</p>
        </div>
        <div className="flex items-center gap-2">
          <CreateIssueDialog projectId={params.projectId} />
          <Link
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white"
            href={`/workspaces/${params.workspaceId}/projects/${params.projectId}/backlog`}
          >
            View backlog
          </Link>
        </div>
      </div>
      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="backlog" asChild>
            <Link href={`/workspaces/${params.workspaceId}/projects/${params.projectId}/backlog`}>Backlog</Link>
          </TabsTrigger>
          <TabsTrigger value="settings" asChild>
            <Link href={`/workspaces/${params.workspaceId}/projects/${params.projectId}/settings`}>Settings</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <BoardView projectId={params.projectId} />
      <IssueDrawer projectId={params.projectId} />
    </div>
  );
}
