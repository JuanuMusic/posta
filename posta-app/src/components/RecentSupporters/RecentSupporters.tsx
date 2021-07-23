import { ReactComponent as BurningHeart } from "../../assets/burning_heart.svg";
import { ethers } from "ethers";
import moment from "moment";
import { useEffect, useState } from "react";
import { Card, ListGroup } from "react-bootstrap";
import { useContractProvider } from "../../contextProviders/ContractsProvider";
import { PostaService } from "../../posta-lib";
import {truncateTextMiddle} from "../../utils/textHelpers";
import { Link } from "react-router-dom";

export default function RecentSupporters(props: any) {
  const [lastSupporters, setLastSupporters] = useState<
    SupportGivenLog[] | null
  >(null);
  const contractProvider = useContractProvider();

  useEffect(() => {
    async function refreshLastSupporters() {
      if (!contractProvider) return;
      const supporters = await PostaService.getLastSupporters(
        10,
        contractProvider
      );
      setLastSupporters(supporters);
    }

    refreshLastSupporters();
  }, [contractProvider]);

  return (
    <Card className={props.className + " bg-dark"}>
      <Card.Header className="p-1">
        <h6>Recent Supporters</h6>
      </Card.Header>
      <Card.Body className="p-1 bg-secondary">
        <ListGroup variant="flush" className="my-1">
          {lastSupporters &&
            lastSupporters.map((support, index) => (
              <SupportItem support={support} key={index} />
            ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}

function SupportItem({ support }: { support: SupportGivenLog }) {
  return (
    <ListGroup.Item
      variant="light"
      className="py-0 px-2 text-center font-weight-light my-0"
    >
      <p className="p-0 m-0 text-right">
        <small>
          {moment(support.blockTime || new Date(0)).format(
            "MMM D, YYYY - HH:mm"
          )}
        </small>
      </p>
      <p className="p-0 m-0 d-flex flex-column justify-content-center align-items-center text-danger">
        <small>
          <BurningHeart className="icon-sm mb-1" />
          <Link
            to={`/human/${support.supporter.toString()}`}
          >{`${truncateTextMiddle(4, support.supporter, 4)}`}</Link>{" "}
          burned{" "}
          <span className="font-weight-bold">
            {ethers.utils.formatEther(support.burnt.toString())}
          </span>{" "}
          $UBI on
          <Link to={`/post/${support.tokenId.toString()}`}>
            $POSTA:{support.tokenId.toString()}
          </Link>
        </small>
      </p>
    </ListGroup.Item>
  );
}
