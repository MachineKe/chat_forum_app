import RichMediaInput from "@components/common/RichMediaInput";

export default function CommentInput(props) {
  return (
    <RichMediaInput
      {...props}
      placeholder={props.placeholder || "Write a comment..."}
      actionLabel={props.actionLabel || "Comment"}
    />
  );
}
