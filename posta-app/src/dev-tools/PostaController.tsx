import { useWeb3React } from "@web3-react/core";
import { Button, FormControl, InputGroup } from "react-bootstrap";
import { Web3Provider } from "@ethersproject/providers";
import { useState } from "react";
import useContractProvider from "src/hooks/useContractProvider";
import { PostaService } from "posta-lib/build";

interface IPostaControllerProps {
  owner: string;
}

export default function PostaController(props: IPostaControllerProps) {
  const [baseURI, setBaseURI] = useState("");
  const contractProvider = useContractProvider();

  const handleSetBaseUrlClicked = async () => {
    if (!contractProvider) return;
    await PostaService.setBaseURI(props.owner, baseURI, contractProvider);
    console.log("Base URI updated");
  };

  return (
    <div className="d-flex">
      <InputGroup className="mb-3">
        <FormControl
          placeholder="Tokens Base URI"
          aria-label="Tokens Base URI"
          aria-describedby="basic-addon2"
          value={baseURI}
          onChange={(e) => setBaseURI(e.target.value)}
        />
        <InputGroup.Append>
          <Button onClick={handleSetBaseUrlClicked}>Set base URI</Button>
        </InputGroup.Append>
      </InputGroup>
    </div>
  );
}
