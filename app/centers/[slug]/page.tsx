import { Suspense } from "react";
import CenterDetails from "./CenterDetails";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = {
  slug: string;
};

export default function CenterDetailsPage({ params }: { params: Params }) {
  return (
    <Suspense>
      <CenterDetails slug={params.slug} />
    </Suspense>
  );
}
