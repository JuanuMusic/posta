import { useWeb3React } from "@web3-react/core";
import { Button, FormControl, InputGroup } from "react-bootstrap";
import PostaService from "../services/PostaService";
import { Web3Provider } from "@ethersproject/providers";
import { useState } from "react";

interface IPostaControllerProps {
  owner: string;
}

export default function PostaController(props: IPostaControllerProps) {
  const context = useWeb3React<Web3Provider>();
  const [baseURI, setBaseURI] = useState("");
  const [loadedBaseURI, setLoadedBaseURI] = useState("");

  const handleSetBaseUrlClicked = async () => {
    await PostaService.setBaseURI(
      props.owner,
      baseURI,
      new Web3Provider(context.library?.provider!)
    );
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
