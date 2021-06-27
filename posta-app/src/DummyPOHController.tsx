import { useWeb3React } from "@web3-react/core";
import React from "react";
import { Button } from "react-bootstrap"
import DummyPOHService from "./services/DummyPOHService";
import { Web3Provider } from "@ethersproject/providers";

export default function DummyPOHController(props: IBasePostaProps) {

    const context = useWeb3React<Web3Provider>()

    const handleRegisterHumanClicked = async () => {
        await DummyPOHService.registerHuman(props.human.address, new Web3Provider(context.library?.provider!));
        console.log("REGISTERED");
    }

    return(<div>
        <Button onClick={handleRegisterHumanClicked}>Register as Human</Button>
    </div>)
}