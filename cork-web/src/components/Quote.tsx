import { useState, useEffect } from "react";
import { quoteResponseSchema } from "../schemas/quote";
import type { QuoteResponse } from "../schemas/quote";

function Quote() {
  const [loading, setLoading] = useState<boolean>(true);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/quotes")
      .then((res) => res.json())
      .then((data) => {
        const parsed = quoteResponseSchema.safeParse(data);
        if (parsed.success) {
          setQuote(parsed.data);
        } else {
          console.error(parsed.error);
          setError(`Failed to parse quote: ${parsed.error}`);
        }
      })
      .catch((err) => setError(`Failed to fetch quote: ${err}`))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mt-2 mb-0">Loading Quote of the day...</p>
      </div>
    );

  return (
    <>
      {error && (
        <div className="alert alert-danger shadow-sm m-4" role="alert">
          <h5 className="alert-heading fw-bold mb-1">{error}</h5>
        </div>
      )}
      {quote && (
        <div className="border-0 shadow-sm rounded-4 py-4 px-3 bg-light">
          <div className="card shadow-sm border-0 bg-white text-center py-4 px-3 d-flex">
            <p className="card-title mb-0 fw-semibold fst-italic">
              {quote.quote}
            </p>
            <p>- {quote.author}</p>
          </div>
        </div>
      )}
    </>
  );
}

export default Quote;
