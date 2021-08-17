import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { propTypes } from "react-bootstrap/esm/Image";
import { usePostaContext } from "../contextProviders/PostaContext";
import { PostaService } from "../posta-lib";

export default function ContractSettings(props: any) {
  const [burnPct, setBurnPct] = useState("");
  const [treasuryPct, setTreasuryPct] = useState("");
  const { contractProvider, postaService } = usePostaContext();

  // Refresh contract settings
  useEffect(() => {
    async function refreshContractSettings() {
      if (!postaService) return;
      const burnPct = await postaService.getBurnPct();
      const treasuryPct = await postaService.getTreasuryPct();
      setBurnPct(burnPct.toString());
      setTreasuryPct(treasuryPct.toString());
    }

    refreshContractSettings();
  }, [contractProvider]);

  return (
    <Card className={"bg-dark p-0 " + (props.className || "")}>
      <Card.Header className="p-1 bg-dark">
        <h6 className="m-0">Current contract settings</h6>
      </Card.Header>
      <Card.Body className="p-0 bg-light" style={{ fontSize: "0.75rem" }}>
        <ul className="mb-1 text-dark">
          <li>
            UBI burn factor: {burnPct && ethers.utils.formatEther(burnPct)}
          </li>
          <li>
            Treasury UBI commision:{" "}
            {treasuryPct && ethers.utils.formatEther(treasuryPct)}
          </li>
        </ul>
      </Card.Body>
    </Card>
  );
}
