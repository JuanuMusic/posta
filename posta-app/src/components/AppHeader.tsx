import { FaGithub, FaQuestion } from "react-icons/fa";
import { Link } from "react-router-dom";
import ConnectWalletButton from "./ConnectWalletButton";

export default function AppHeader(props: any) {
  return (
    <div {...props}>
      <div className="d-flex justify-content-between align-items-center m-0">
        <div>
          <h1>
            <a role="h1" className="text-light" href="/">
              Posta
            </a>
          </h1>
        </div>
        <ConnectWalletButton className="text-right mb-2" />
      </div>
      <span>Microblogging for human beings<br />
      <hr className="bg-secondary m-0 mb-2" />
      <small>Powered by <strong><a href="https://www.proofofhumanity.id/" target="_blank">Proof of Humanity</a></strong></small></span>
    </div>
  );
}
