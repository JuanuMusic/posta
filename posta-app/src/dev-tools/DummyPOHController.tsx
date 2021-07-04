import { useWeb3React } from "@web3-react/core";
import { Button } from "react-bootstrap"
import { ethers } from "ethers";
import useContractProvider from "../hooks/useContractProvider";
import { useHuman } from "../contextProviders/HumanProvider";


export default function DummyPOHController(props: IBasePostaProps) {
    const contractProvider = useContractProvider();
    const context = useWeb3React<ethers.providers.Web3Provider>();
    const human = useHuman();

    const handleRegisterHumanClicked = async () => {
        if(!contractProvider || !context.account) return;
        const poh = await contractProvider.getDummyPOHContractForWrite(context.account);
        await poh.register(human.profile.eth_address);
        console.log("REGISTERED");
    }

    return(<div>
        <Button onClick={handleRegisterHumanClicked}>Register as Human</Button>
    </div>)
}
