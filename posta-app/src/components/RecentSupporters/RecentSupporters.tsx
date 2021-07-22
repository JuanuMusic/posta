import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Card, ListGroup } from "react-bootstrap";
import { useContractProvider } from "../../contextProviders/ContractsProvider";
import { PostaService } from "../../posta-lib";
import truncateTextMiddle from "../../utils/textHelpers";

export default function RecentSupporters(props: any) {
  const [lastSupporters, setLastSupporters] = useState<SupporterLog[] | null>(
    null
  );
  const contractProvider = useContractProvider();

  useEffect(() => {
    async function refreshLastSupporters() {
      if (!contractProvider) return;
      const supporters = await PostaService.getLastSupporters(
        10,
        contractProvider
      );
      setLastSupporters(supporters);

      console.log("SUPPORTERS", supporters);
    }

    refreshLastSupporters();
  }, [contractProvider]);

  return (
    <Card className={props.className + " bg-dark"}>
      <Card.Header className="p-1">
        <h6>Recent Supporters</h6>
      </Card.Header>
      <Card.Body>
        {lastSupporters &&
          lastSupporters.map((supporter) => (
            <ListGroup variant="flush">
              <ListGroup.Item variant="dark">
                <small>
                  {`${truncateTextMiddle(4, supporter.supporter, 4)} supported $POSTA:${supporter.tokenId.toString()} with ${ethers.utils.formatEther(supporter.amount)} UBI`}
                </small>
              </ListGroup.Item>
            </ListGroup>
          ))}
      </Card.Body>
    </Card>
  );
}
