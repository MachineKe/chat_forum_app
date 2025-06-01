import RichMediaInput from "@components/common/RichMediaInput";

export default function PostInput(props) {
  return (
    <RichMediaInput
      {...props}
      placeholder={props.placeholder || "What's happening?"}
      actionLabel={props.actionLabel || "Next"}
    />
  );
}
