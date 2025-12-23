export default function CompletedStep({ onDashboard, onPostJob }) {
  return (
    <div className="py-16 flex flex-col items-center text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        ✅
      </div>
      <h2 className="text-2xl font-semibold">Congratulations, Your profile is 100% complete!</h2>
      <p className="text-muted-foreground max-w-xl">
        You can now view dashboard or post a job.
      </p>

      <div className="flex gap-3 mt-4">
        <button className="px-4 py-2 rounded-md border" onClick={onDashboard}>View Dashboard</button>
        <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground" onClick={onPostJob}>Post Job →</button>
      </div>
    </div>
  );
}
