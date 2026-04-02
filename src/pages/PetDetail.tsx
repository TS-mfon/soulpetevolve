import { SoulPetsWorkspace } from "@/components/SoulPetsWorkspace";
import { useParams } from "react-router-dom";

export default function PetDetail() {
  const { tokenId } = useParams<{ tokenId: string }>();

  return <SoulPetsWorkspace initialTokenId={tokenId ?? null} />;
}