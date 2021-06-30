import { FaGithub, FaQuestion } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function AppHeader() {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center m-0">
        <div>
          <h1><a role="h1" className="text-light" href="/">Posta</a></h1>
        </div>
        <div>
          <a className="m-2" href="https://github.com/JuanuMusic/posta/blob/main/README.md" target="_blank">
            <FaQuestion size={20} className="text-light" />
          </a>
          <a className="m-2" href="https://github.com/juanumusic/posta" target="_blank">
            <FaGithub size={30} className="text-light" />
          </a>
        </div>
      </div>
      <hr className="bg-secondary m-0 mb-2" />
    </>
  );
}
