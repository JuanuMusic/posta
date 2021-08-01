import { useEffect, useState } from "react";
import { Card, Modal } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { fetchUrlMetadata, URLMetadata } from "../../../utils/fetchUrlMetadata";
import ImagePreviewModal from "../../ImagePreviewModal";

interface IUrlPreviewerProps {
  url: string;
}

export default function UrlPreviewer(props: IUrlPreviewerProps) {
  const [metadata, setMetadata] = useState<URLMetadata | null>(null);
  const [isPreviewImageVisible, setIsPreviewImageVisible] = useState(false);

  useEffect(() => {
    async function loadPreview() {
      if (props.url !== "test") {
        const newMetadata = await fetchUrlMetadata(props.url);
        setMetadata(newMetadata);
      } else {
        setMetadata({
          image:
            "https://ipfs.kleros.io/ipfs/QmY9L11JwZoHazuvBJU9z6YnaNSfXNtNZVJp4gwhfYEQPd/20210506-180407.jpg",
          isImage: true,
          description: "",
          title: "",
        });
      }
    }

    if (props.url) loadPreview();
  }, [props.url]);

  const handleImageClick = async () => {
    
  };

  const handlePreviewClicked = () => {
    if(!metadata?.isImage) {
      window.open(props.url);
    }
    else {
      metadata && metadata.isImage && setIsPreviewImageVisible(true);
    }    
  } 

  return (
    metadata && (
      <>
        {metadata && metadata.isImage && (
          <ImagePreviewModal
            show={isPreviewImageVisible}
            onHide={() => setIsPreviewImageVisible(false)}
            imageSrc={metadata.image}
          />
        )}
        <Card className="p-1">
            <div onClick={handlePreviewClicked} className={`d-flex justify-content-center align-items-start`}>
              {metadata.image && (
                <img
                  className={`url-preview-image ${
                    metadata.isImage ? "url-preview-image-only" : ""
                  }`}
                  src={metadata.image}
                />
              )}
              {!metadata.isImage && (
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
              )}
            </div>
        </Card>
      </>
    )
  );
}
