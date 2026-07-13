import { createFileRoute } from "@tanstack/react-router";
import { Download, Eye, FileText, FolderOpen, Receipt, ScrollText } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_layout/documents")({
  head: () => ({ meta: [{ title: "Documents · Gurimaal" }] }),
  component: DocumentsPage,
});

type DocumentFile = {
  name: string;
  type: string;
  size: string;
  date: string;
  url?: string;
};

type DocumentSection = {
  title: string;
  description: string;
  icon: typeof FileText;
  files: DocumentFile[];
};

const sections: DocumentSection[] = [
  {
    title: "Lease Agreement",
    description: "Your lease agreements and related addendums",
    icon: ScrollText,
    files: [],
  },
  {
    title: "Invoices",
    description: "Monthly rent and utility invoices",
    icon: FileText,
    files: [],
  },
  {
    title: "Receipts",
    description: "Payment receipts and confirmations",
    icon: Download,
    files: [],
  },
  {
    title: "Move-in Documents",
    description: "Inspection reports and move-in records",
    icon: FolderOpen,
    files: [],
  },
];

function DocumentsPage() {
  return (
    <>
      <PageHeader
        title="Documents"
        description="Everything related to your tenancy in one place."
      />

      <section className="grid gap-5 sm:gap-7 lg:grid-cols-2">
        {sections.map((section) => (
          <DocumentSectionCard key={section.title} section={section} />
        ))}
      </section>
    </>
  );
}

function DocumentSectionCard({ section }: { section: DocumentSection }) {
  const Icon = section.icon;

  return (
    <Card className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <CardContent className="p-0">
        <div className="flex items-center gap-4 border-b border-border p-5 sm:gap-5 sm:p-7">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary sm:h-16 sm:w-16">
            <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-extrabold text-foreground sm:text-2xl">{section.title}</h2>
            <p className="mt-1 text-sm font-medium text-muted-foreground sm:text-base">
              {section.description}
            </p>
          </div>
          <span className="grid min-w-10 place-items-center rounded-full bg-muted px-3 py-1.5 text-base font-extrabold text-muted-foreground sm:min-w-11 sm:text-lg">
            {section.files.length}
          </span>
        </div>

        {section.files.length ? (
          <div className="divide-y divide-border">
            {section.files.map((file) => (
              <DocumentRow key={file.name} file={file} />
            ))}
          </div>
        ) : (
          <div className="p-5 sm:p-7">
            <div className="grid min-h-40 place-items-center rounded-2xl border-2 border-dashed border-border bg-card text-center sm:min-h-48">
              <div>
                <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground/60" />
                <p className="mt-5 text-base font-semibold text-muted-foreground">
                  No files available yet
                </p>
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  Documents shared by management will appear here.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DocumentRow({ file }: { file: DocumentFile }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 bg-muted/25 px-5 py-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-5 sm:px-7">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-red-50 text-red-500 sm:h-14 sm:w-14">
        <Receipt className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-base font-extrabold text-foreground sm:text-xl">{file.name}</p>
        <p className="mt-1 truncate text-sm font-semibold text-muted-foreground sm:text-base">
          {file.type} · {file.size} · {file.date}
        </p>
      </div>
      <div className="col-start-2 flex items-center gap-3 text-muted-foreground sm:col-start-auto sm:gap-4">
        <IconButton label="Preview document" icon={Eye} file={file} action="preview" />
        <IconButton label="Download document" icon={Download} file={file} action="download" />
      </div>
    </div>
  );
}

function IconButton({
  label,
  icon: Icon,
  file,
  action,
}: {
  label: string;
  icon: typeof Eye;
  file: DocumentFile;
  action: "preview" | "download";
}) {
  function handleClick() {
    if (!file.url) {
      window.alert(`${file.name} is listed, but no file is attached yet.`);
      return;
    }

    if (action === "preview") {
      window.open(file.url, "_blank", "noopener,noreferrer");
      return;
    }

    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    link.click();
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={handleClick}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition",
        "hover:bg-primary-soft hover:text-primary",
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
