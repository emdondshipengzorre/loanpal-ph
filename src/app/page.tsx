import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
          <span className="text-2xl font-bold text-primary-foreground">L</span>
        </div>

        <h1 className="text-4xl font-bold tracking-tight">LoanPal PH</h1>

        <p className="mt-3 text-lg text-muted-foreground">
          Manage all your loans in one place
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          Track HomeCredit, Tala, Cashalo, Atome, GLoan and more — never miss a
          payment again.
        </p>

        <Button size="lg" className="mt-8">
          Add your first loan
        </Button>

        <p className="mt-12 text-xs text-muted-foreground/60">
          Built for Filipinos, by Filipinos
        </p>
      </div>
    </div>
  );
}
