import { Button, ButtonProps } from "react-bootstrap";

interface IconButtonProps extends ButtonProps {
  text: string;
  icon: any;
}

export function IconButton(props: IconButtonProps) {
  return (
    <Button {...props}>
      <div className="d-flex justify-content-center align-items-center">
        {props.icon}
        {props.text}
      </div>
    </Button>
  );
}
