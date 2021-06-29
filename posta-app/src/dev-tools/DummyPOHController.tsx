import { useWeb3React } from "@web3-react/core";
import { Button } from "react-bootstrap"
import { ethers } from "ethers";
import useContractProvider from "../hooks/useContractProvider";


export default function DummyPOHController(props: IBasePostaProps) {
    const contractProvider = useContractProvider();
    const context = useWeb3React<ethers.providers.Web3Provider>();

    const handleRegisterHumanClicked = async () => {
        if(!contractProvider || !context.account) return;
        const poh = await contractProvider.getDummyPOHContractForWrite(context.account);
        await poh.register(props.human.address);
        console.log("REGISTERED");
    }

    return(<div>
        <Button onClick={handleRegisterHumanClicked}>Register as Human</Button>
    </div>)
}