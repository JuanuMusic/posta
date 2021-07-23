import { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import Skeleton from "react-loading-skeleton";
import { useContractProvider } from "../contextProviders/ContractsProvider";
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
  const contractProvider = useContractProvider();
  console.log("Human address", props.humanAddress);
  /**
   * Loads the human's data
   */
  async function loadHumanData() {
    if (!contractProvider || !props.humanAddress) return;
    setIsLoading(true);
    const human = await PohService.getHuman(props.humanAddress, contractProvider);
    setCurrentHuman(human);
    setIsLoading(false);
  }

  useEffect(() => {
    loadHumanData();
  }, [props.humanAddress, contractProvider]);

  useEffect(() => {
    if (props.human) setCurrentHuman(props.human);
  }, [props.human]);

  return (
    <Card className={props.className || ""}>
      <Card.Body className={"d-flex" + (props.condensed && " py-1")}>
        <ProfilePicture
          size={props.condensed ? AvatarSize.Small : AvatarSize.Large}
          imageUrl={currentHuman && currentHuman.photo}
        />
        <div>
          {props.condensed ?  (<h6 className="text-dark mb-0">
          {isLoading ? (
              <Skeleton />
            ) : (
              currentHuman && currentHuman.display_name
            )}
          </h6>) :
          (<h4 className="text-dark mb-0">
            {isLoading ? (
              <Skeleton />
            ) : (
              currentHuman && currentHuman.display_name
            )}
          </h4>)}
          <small>
            <a
              href={`${process.env.REACT_APP_HUMAN_PROFILE_BASE_URL}/${currentHuman?.eth_address}`}
              className="text-dark"
              target="_blank"
            >
              View on Proof of Humanity
            </a>
          </small>
        </div>
      </Card.Body>
    </Card>
  );
}
