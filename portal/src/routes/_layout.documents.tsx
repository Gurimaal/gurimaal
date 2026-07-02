import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, IdCard, KeyRound, Receipt, ScrollText } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_layout/documents")({
  head: () => ({ meta: [{ title: "Documents · Gurimaal" }] }),
  component: DocumentsPage,
});

const sections = [
  {
    title: "Lease agreement",
    icon: ScrollText,
    docs: [
      { name: "Lease_Agreement_2025.pdf", meta: "Signed Mar 12, 2025 · 2.4 MB" },
      { name: "Lease_Addendum_Parking.pdf", meta: "Signed Mar 15, 2025 · 620 KB" },
    ],
  },
  {
    title: "Invoices",
    icon: FileText,
    docs: [
      { name: "INV-2026-072.pdf", meta: "Rent · July · 180 KB" },
      { name: "INV-2026-065.pdf", meta: "Rent · June · 178 KB" },
      { name: "INV-2026-064.pdf", meta: "Utilities · May · 210 KB" },
    ],
  },
  {
    title: "Receipts",
    icon: Receipt,
    docs: [
      { name: "Receipt_2026-06-03.pdf", meta: "Jun 3, 2026 · 96 KB" },
      { name: "Receipt_2026-05-05.pdf", meta: "May 5, 2026 · 96 KB" },
    ],
  },
  {
    title: "Move-in documents",
    icon: KeyRound,
    docs: [
      { name: "Move_In_Inspection.pdf", meta: "Mar 15, 2025 · 3.1 MB" },
      { name: "Inventory_Checklist.pdf", meta: "Mar 15, 2025 · 1.2 MB" },
    ],
  },
  {
    title: "Identity documents",
    icon: IdCard,
    docs: [
      { name: "National_ID_Copy.pdf", meta: "Uploaded Mar 10, 2025 · 720 KB" },
      { name: "Passport_Copy.pdf", meta: "Uploaded Mar 10, 2025 · 1.4 MB" },
    ],
  },
];

function DocumentsPage() {
  return (
    <>
      <PageHeader
        title="Documents"
        description="Everything related to your tenancy in one place."
        actions={<Button variant="outline">Upload document</Button>}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        {sections.map((s) => (
          <Card key={s.title} className="card-elevated">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">{s.title}</CardTitle>
                <p className="text-xs text-muted-foreground">{s.docs.length} files</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {s.docs.map((d) => (
                <div
                  key={d.name}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border p-3 transition hover:bg-muted/40"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{d.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{d.meta}</p>
                  </div>
                  <Button size="icon" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  );
}
