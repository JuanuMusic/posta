import { useEffect, useState } from "react";
import {
  FormControl,
  InputGroup,
  Modal,
  Button,
  Spinner,
} from "react-bootstrap";
import { Gem } from "react-bootstrap-icons";

import { BigNumber, ethers, utils } from "ethers";
import { PostaService, UBIService } from "../posta-lib";
import { useHuman } from "../contextProviders/HumanProvider";
import { usePostaContext } from "../contextProviders/PostaContext";

interface ISupportPostDialogProps extends IBasePostaProps {
  show: boolean;
  postTokenId: BigNumber;
  onClose?(): any;
}

/**
 * Hook that updates the current UBI balance.
 * @param address
 * @returns
 */
function useUBIBalance(address: string) {
  const [currentUBIBalance, setCurrentUBIBalance] = useState(BigNumber.from(0));
  const {ubiService, postaService} = usePostaContext();

  useEffect(() => {
    async function getBalance() {
      if (!address) return;
      if (!ubiService) return;
      const balance = await ubiService.balanceOf(address);
      // Update the current UBI balance.
      setCurrentUBIBalance(balance);
    }

    getBalance();
  }, [address, ubiService]);

  return currentUBIBalance;
}

function SupportPostDialog(props: ISupportPostDialogProps) {
  const {postaService} = usePostaContext();
  const human = useHuman();
  const [amount, setAmount] = useState("");
  const currentUBIBalance = useUBIBalance(human.profile.eth_address || "");
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isBurning, setIsBurning] = useState(false);

  const handleClose = () => {
    if (!isApproving && !isBurning) props.onClose && props.onClose();
  };

  const handleApproveBurn = async () => {
    if (!postaService) return;
    if (amount) {
      setIsApproving(true);
      const parsedAmount = utils.parseEther(amount);

      if (
        parsedAmount.gt(BigNumber.from("0")) &&
        parsedAmount.lte(currentUBIBalance)
      ) {
        await postaService.requestBurnApproval(
          human.profile.eth_address || "",
          parsedAmount
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
    if (!postaService) return;
    if (amount) {
      const parsedAmount = utils.parseEther(amount);

      if (
        parsedAmount.gt(BigNumber.from("0")) &&
        parsedAmount.lte(currentUBIBalance)
      ) {
        setIsBurning(true);
        await postaService.giveSupport(
          props.postTokenId,
          parsedAmount,
          human.profile.eth_address || "",
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
          <h5>Support $POSTA:{props.postTokenId.toString()}</h5>
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
          <span>{isApproving ? "Approving..." : "Approve"}</span>
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
