interface MessageBannerProps {
  type: "error" | "success";
  message: string;
}

export const MessageBanner = ({ type, message }: MessageBannerProps) => {
  const className = type === "error" ? "status-banner" : "success-banner";
  return <div className={className}>{message}</div>;
};
