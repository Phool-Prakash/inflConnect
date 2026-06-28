import AdminInfluencerEdit from "./AdminInfluencerEdit";

export const metadata = {
  title: "Edit Influencer",
  robots: { index: false, follow: false },
};

export default async function AdminInfluencerEditPage({ params }) {
  const { id } = await params;
  return <AdminInfluencerEdit id={id} />;
}
