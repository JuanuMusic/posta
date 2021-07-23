import { ReactComponent as POHLogo } from "../assets/poh.svg";

export enum AvatarSize {
  Small = "avatar-sm",
  Regular = "avatar",
  Large = "avatar-lg",
}

export default function ProfilePicture(props: {
  size: AvatarSize;
  imageUrl?: string | null;
}) {
  const avatarClass = props.size || "avatar";
  return (
    (props.imageUrl && (
      <img className={`${avatarClass} mr-2`} src={props.imageUrl} />
    )) || (
      <POHLogo
        className={`flex-shrink-0 ${avatarClass} mr-2 text-secondary p-1 bg-secondary`}
      />
    )
  );
}
