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
import PostaService from "../services/PostaService";
import UBIService from "../services/UBIService";
import { Web3Provider } from "@ethersproject/providers";
import { BigNumber, ethers, utils } from "ethers";
import { useWeb3React } from "@web3-react/core";

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
  const context = useWeb3React<Web3Provider>();
  const [currentUBIBalance, setCurrentUBIBalance] = useState(BigNumber.from(0));
  useEffect(() => {
    if (!address) return;
    async function getBalance() {
      const balance = await UBIService.balanceOf(
        address,
        new ethers.providers.Web3Provider(context.library?.provider!)
      );
      // Update the current UBI balance.
      setCurrentUBIBalance(balance);
    }

    getBalance();
  }, [address]);

  return currentUBIBalance;
}

function SupportPostDialog(props: ISupportPostDialogProps) {
  const [amount, setAmount] = useState("");
  const currentUBIBalance = useUBIBalance(props.human.address);
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const context = useWeb3React<Web3Provider>();

  const handleClose = () => {
    if (!isApproving && !isBurning) props.onClose && props.onClose();
  };

  const handleApproveBurn = async () => {
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
          new ethers.providers.Web3Provider(context.library?.provider!)
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
          new ethers.providers.Web3Provider(context.library?.provider!),
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
