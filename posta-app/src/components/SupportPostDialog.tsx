import React, { ChangeEventHandler, useEffect, useState } from "react";
import {
  FormControl,
  InputGroup,
  ModalBody,
  ModalTitle,
  Modal,
  Button,
  Spinner,
} from "react-bootstrap";
import { Gem } from "react-bootstrap-icons";

import { BigNumber, ethers, utils } from "ethers";
import { useWeb3React } from "@web3-react/core";
import useContractProvider from "src/hooks/useContractProvider";
import { PostaService, UBIService } from "posta-lib/build";

interface ISupportPostDialogProps extends IBasePostaProps {
  show: boolean;
  postTokenId: string;
  onClose?(): any;
}

/**
 * Hook that updates the current UBI balance.
 * @param address
 * @returns
 */
function useUBIBalance(address: string) {
  
  const [currentUBIBalance, setCurrentUBIBalance] = useState(BigNumber.from(0));
  const contractProvider = useContractProvider();
  
  useEffect(() => {
    async function getBalance() {
      if (!address) return;
      if(!contractProvider) return;
      // const balance = await UBIService.balanceOf(address, contractProvider);
      // // Update the current UBI balance.
      // setCurrentUBIBalance(balance);
    }

    getBalance();
  }, [address, contractProvider]);

  return currentUBIBalance;
}

function SupportPostDialog(props: ISupportPostDialogProps) {
  const contractProvider = useContractProvider();
  const [amount, setAmount] = useState("");
  const currentUBIBalance = useUBIBalance(props.human.address);
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isBurning, setIsBurning] = useState(false);

  const handleClose = () => {
    if (!isApproving && !isBurning) props.onClose && props.onClose();
  };

  const handleApproveBurn = async () => {
    if(!contractProvider) return;
    if (amount) {
      setIsApproving(true);
      const parsedAmount = utils.parseEther(amount);

      if (
        parsedAmount.gt(BigNumber.from("0")) &&
        parsedAmount.lte(currentUBIBalance)
      ) {
        await PostaService.requestBurnApproval(
          props.human.address,
          parsedAmount,
          contractProvider
        );

        setIsApproved(true);
        setIsApproving(false);
      }
    }
  };

  /**
   * Send  request to burn UBIs. First approves the ammount and then burns it.
   */
  const handleGiveUBISupport = async () => {
    if(!contractProvider) return;
    if (amount) {
      const parsedAmount = utils.parseEther(amount);

      if (
        parsedAmount.gt(BigNumber.from("0")) &&
        parsedAmount.lte(currentUBIBalance)
      ) {
        setIsBurning(true);
        await PostaService.giveSupport(
          props.postTokenId,
          parsedAmount,
          props.human.address,
          contractProvider,
          0
        );
        setIsBurning(false);
        props.onClose && props.onClose();
      }
    }
  };

  const handleAmountChanged = (e: any) => {
    setAmount(e.target.value);
  };

  const _isAmountValid = () => {
    if (!amount) return false;
    let parsedAmount = ethers.utils.parseEther(amount);
    return (
      parsedAmount.gt(BigNumber.from(0)) && parsedAmount.lte(currentUBIBalance)
    );
  };

  const _isConfirmButtonEnabled = () => {
    return isApproved && !isBurning && _isAmountValid();
  };

  const _isApproveButtonEnabled = () => {
    return !isApproved && !isApproving && _isAmountValid();
  };

  return (
    <Modal show={props.show} onHide={handleClose} centered>
      <Modal.Header>
        <Modal.Title>
          Support Post <span className="muted">({props.postTokenId})</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        UBI Balance: {ethers.utils.formatEther(currentUBIBalance.toString())}
        <InputGroup className="mb-2 mr-sm-2">
          <InputGroup.Prepend>
            <InputGroup.Text>
              <Gem />
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl
            type="number"
            step="0.1"
            min="0"
            id="ubiToBurn"
            placeholder="Amount of UBIs to burn"
            value={amount?.toString()}
            onChange={handleAmountChanged}
          />
        </InputGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button
          disabled={!_isApproveButtonEnabled()}
          onClick={handleApproveBurn}
        >
          Approve{" "}
          {isApproving && (
            <Spinner animation="border" variant="light" size="sm" />
          )}
        </Button>
        <Button
          disabled={!_isConfirmButtonEnabled()}
          onClick={handleGiveUBISupport}
        >
          {"Support & Burn"}{" "}
          {isBurning && (
            <Spinner animation="border" variant="light" size="sm" />
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SupportPostDialog;
