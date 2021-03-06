import { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import Skeleton from "react-loading-skeleton";
import { usePostaContext } from "../contextProviders/PostaContext";
import { PohService } from "../posta-lib";
import { POHProfileModel } from "../posta-lib/services/PohAPI";
import ProfilePicture, { AvatarSize } from "./ProfilePicture";

interface HumanCardProps {
  human?: POHProfileModel;
  humanAddress?: string;
  className?: string;
  condensed?: boolean;
}

export default function HumanCard(props: HumanCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentHuman, setCurrentHuman] = useState<POHProfileModel | null>(
    null
  );
  const { pohService } = usePostaContext();
  console.log("Human address", props.humanAddress);
  /**
   * Loads the human's data
   */
  async function loadHumanData() {
    if (!pohService || !props.humanAddress) return;
    setIsLoading(true);
    const human = await pohService.getHuman(props.humanAddress);
    setCurrentHuman(human);
    setIsLoading(false);
  }

  useEffect(() => {
    loadHumanData();
  }, [props.humanAddress, pohService]);

  useEffect(() => {
    if (props.human) setCurrentHuman(props.human);
  }, [props.human]);

  return (
    <Card className={props.className || ""}>
      <Card.Body
        className={
          "d-flex justify-content-center align-items-center " +
          (props.condensed && "p-1")
        }
      >
        <ProfilePicture
          size={props.condensed ? AvatarSize.Small : AvatarSize.Large}
          imageUrl={currentHuman && currentHuman.photo}
        />
        <div>
          <HumanNameDisplay
            condensed={props.condensed}
            name={(currentHuman && currentHuman.display_name) || ""}
            isLoading={isLoading}
          />
          {!props.condensed && (
            <small>
              <a
                href={`${process.env.REACT_APP_HUMAN_PROFILE_BASE_URL}/${currentHuman?.eth_address}`}
                className="text-dark"
                target="_blank"
              >
                View on Proof of Humanity
              </a>
            </small>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

function HumanNameDisplay(props: {
  name: string;
  condensed?: boolean;
  isLoading?: boolean;
}) {
  return props.condensed ? (
    <h6 className="text-dark mb-0">
      {props.isLoading ? <Skeleton /> : props.name}
    </h6>
  ) : (
    <h4 className="text-dark mb-0">
      {props.isLoading ? <Skeleton /> : props.name}
    </h4>
  );
}
