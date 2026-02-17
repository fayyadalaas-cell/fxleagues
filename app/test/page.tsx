import { supabase } from "@/lib/supabase";

export default async function TestPage() {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*");

  return (
    <div style={{ padding: "40px" }}>
      <h1>Supabase Test</h1>

      {error && (
        <p style={{ color: "red" }}>
          Error: {error.message}
        </p>
      )}

      {!error && (
        <pre>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
