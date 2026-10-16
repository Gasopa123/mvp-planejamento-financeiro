import { Marca } from "@/components/auth/auth-shell";
import { LogoutButton } from "@/components/logout-button";

// Cabeçalho compartilhado por carteira, wizard, dashboard e apresentação.
// Padding e altura (px-6 py-4, 67px) ficam como estavam: client-dashboard e
// presentation-dashboard compensam o p-6 do <main> com -m-6 e descontam a
// altura do cabeçalho no min-h.
// No print, a apresentação é o documento: marca e logout saem de cena e o
// padding do <main> zera, pra sobrar só o conteúdo dentro da margem da página.
export default function CarteiraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-canvas print:min-h-0 print:bg-white">
      <header className="flex items-center justify-between border-b border-line bg-white px-6 py-4 print:hidden">
        <Marca className="text-navy" />
        <LogoutButton />
      </header>

      <main className="flex flex-1 flex-col p-6 print:p-0">{children}</main>
    </div>
  );
}
