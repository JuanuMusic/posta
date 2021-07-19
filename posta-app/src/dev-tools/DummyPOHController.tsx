import { Button } from "react-bootstrap";
import { useContractProvider } from "../contextProviders/ContractsProvider";
import { useHuman } from "../contextProviders/HumanProvider";

export default function DummyPOHController(props: IBasePostaProps) {
  const contractProvider = useContractProvider();
  const human = useHuman();

  const handleRegisterHumanClicked = async () => {
    if (!contractProvider) return;
    console.log("REGISTERING WITH", human.profile.eth_address);
    if (human.profile.eth_address) {
      const poh = await contractProvider.getDummyPOHContractForWrite(
        human.profile.eth_address
      );
      await poh.register(human.profile.eth_address);
      console.log("REGISTERED");
    }
  };

  return (
    <div>
      <Button disabled={!contractProvider} onClick={handleRegisterHumanClicked}>
        Register as Human
      </Button>
    </div>
  );
}
