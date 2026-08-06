import { LogoutButton } from "@/components/logout-button";

export default function CarteiraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <span className="text-sm font-semibold text-gray-900">
          Planejamento Financeiro
        </span>
        <LogoutButton />
      </header>

      <main className="flex flex-1 flex-col p-6">{children}</main>
    </div>
  );
}
