export function createSearchUrl(params: {
  query?: string;
  center?: [number, number];
  distance?: number;
}) {
  const urlParams = new URLSearchParams();

  // Always add parameters in the same order
  if (params.query) {
    urlParams.set("q", params.query);
  }

  if (params.center) {
    urlParams.set("center", `${params.center[0]},${params.center[1]}`);
  }

  if (params.distance) {
    urlParams.set("distance", params.distance.toString());
  }

  return `/search?${urlParams.toString()}`;
}
