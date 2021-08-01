import { HTMLAttributes, useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import {
  processString,
  ProcessStringOptions,
} from "../../../utils/processReactString";
import {
  extractLinks,
  REGEX_PROTOCOLESS_URL,
  REGEX_URL,
} from "../../../utils/textHelpers";
import UrlPreviewer from "./UrlPreviewer";

interface IPostaContentDisplayProps extends IIsLoadingProps {
  content: string;
  condensed?: boolean;
  className?: string;
}

export default function PostaContentDisplay(props: IPostaContentDisplayProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  let config: ProcessStringOptions[] = [
    {
      regex: REGEX_URL,
      fn: (key: any, result: string[]) => (
        <span key={key}>
          <a
            target="_blank"
            href={`${result[1]}://${result[2]}.${result[3]}${result[4]}`}
          >
            {result[2]}.{result[3]}
            {result[4]}
          </a>
          {result[5]}
        </span>
      ),
    },
    {
      regex: REGEX_PROTOCOLESS_URL,
      fn: (key: any, result: string[]) => (
        <span key={key}>
          <a
            target="_blank"
            href={`http://${result[1]}.${result[2]}${result[3]}`}
          >
            {result[1]}.{result[2]}
            {result[3]}
          </a>
          {result[4]}
        </span>
      ),
    },
  ];

  useEffect(() => {
    const urls = extractLinks(props.content);
    console.log(urls);
    if (urls && urls.length > 0) setPreviewUrl(urls[0]);
  });
  const content = props.content ? processString(config)(props.content) : "...";

  return (
    <div
      className={
        (props.condensed ? "post-text-sm py-1" : "post-text py-3") +
        " " +
        (props.className || "")
      }
    >
      <p className="text-dark mb-1">
        {props.isLoading ? <Skeleton /> : <>{content || "..."}</>}
      </p>
      {previewUrl && <UrlPreviewer url={previewUrl} />}
    </div>
  );
}
