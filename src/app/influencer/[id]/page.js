import InfluencerProfileClient from "./InfluencerProfileClient";

export async function generateMetadata() {
  return {
    title: "Influencer Profile",
    description: "View influencer profile on InflConnect",
  };
}

export default async function InfluencerProfilePage({ params }) {
  const { id } = await params;
  return <InfluencerProfileClient id={id} />;
}
