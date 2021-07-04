import { FaGithub, FaQuestion } from "react-icons/fa";

export default function SuperHeader(props: any) {
  return (
    <div {...props}>
      <a
        className="p-2"
        href="https://github.com/JuanuMusic/posta/blob/main/README.md"
        target="_blank"
      >
        <FaQuestion size={12} className="text-light" />
      </a>
      <a
        className="p-2"
        href="https://github.com/juanumusic/posta"
        target="_blank"
      >
        <FaGithub size={12} className="text-light" />
      </a>
    </div>
  );
}
