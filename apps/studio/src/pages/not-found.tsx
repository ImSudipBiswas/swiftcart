export default function NotFound() {
  return (
    <main className="h-full flex flex-col items-center justify-center">
      <h1 className="text-4xl md:text-5xl font-bold tracking-widest font-mono">404 Not Found</h1>
      <p className="md:text-lg font-medium text-muted-foreground font-mono tracking-wide mt-1 md:mt-2">
        Sorry, the page you are looking for does not exist.
      </p>
    </main>
  );
}
