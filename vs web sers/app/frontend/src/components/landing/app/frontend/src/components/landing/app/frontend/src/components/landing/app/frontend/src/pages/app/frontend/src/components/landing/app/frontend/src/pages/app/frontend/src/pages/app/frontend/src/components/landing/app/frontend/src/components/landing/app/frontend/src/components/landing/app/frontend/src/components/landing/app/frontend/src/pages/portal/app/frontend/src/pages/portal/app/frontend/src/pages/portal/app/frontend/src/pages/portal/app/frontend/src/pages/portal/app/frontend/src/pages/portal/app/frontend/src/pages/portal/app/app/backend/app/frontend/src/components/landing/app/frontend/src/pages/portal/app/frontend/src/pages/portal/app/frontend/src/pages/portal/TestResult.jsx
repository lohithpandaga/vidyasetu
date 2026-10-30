  const { data: r, isLoading, isError, error } = useQuery({
    queryKey: ["result", resultId],
    queryFn: async () => {
      console.log("result query firing", resultId);
      const res = await api.get(`/api/results/${resultId}`);
      console.log("result query done", res.status);
      return res.data;
    },
    retry: 1,
  });

  if (isError) {
    return <p className="font-mono text-sm text-red-500" data-testid="result-error">Could not load scorecard: {String(error?.message || error)}</p>;
  }

  if (isLoading || !r) {
    return <p className="font-mono text-sm text-muted-foreground animate-pulse" data-testid="result-loading">unsealing your scorecard…</p>;
  }