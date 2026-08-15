import { redirect } from "next/navigation";

export default function RecommendationPage() {
  redirect("/trip-builder?step=recommendation");
}
