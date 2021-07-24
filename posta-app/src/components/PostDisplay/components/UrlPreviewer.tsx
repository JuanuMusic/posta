import { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { fetchUrlMetadata, URLMetadata } from "../../../utils/fetchUrlMetadata";

interface IUrlPreviewerProps {
  url: string;
}

export default function UrlPreviewer(props: IUrlPreviewerProps) {
  const [metadata, setMetadata] = useState<URLMetadata | null>({
    title: "A nice title",
    description:
      " RThe description is always important as long as is not too long",
    image: "https://i.ytimg.com/vi/1y6K3eq1KOw/maxresdefault.jpg",
  });

  useEffect(() => {
    async function loadPreview() {
      const newMetadata = await fetchUrlMetadata(props.url);
      setMetadata(newMetadata);
    }

    //if (props.url) loadPreview();
  }, [props.url]);

  return (
    metadata && (
      <Card className="p-1">
        <a href={props.url} className="text-dark" target="_blank">
          <div className="d-flex justify-content-start align-items-start">
            {metadata.image && (
              <img className="url-preview-image" src={metadata.image} />
            )}
            <div className="d-flex flex-column px-1">
              {metadata.title && (
                <h6 className="mb-0 url-preview-title">{metadata.title}</h6>
              )}
              {metadata.description && (
                <small className="url-preview-description">
                  {metadata.description}
                </small>
              )}
            </div>
          </div>
        </a>
      </Card>
    )
  );
}
