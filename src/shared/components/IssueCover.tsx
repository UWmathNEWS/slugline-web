import React from "react";
import { coverSrc } from "../helpers";
import type { IssueEntryPropsBase } from "./IssueEntry";

import "./styles/IssueCover.scss";

interface IssueCoverProps extends IssueEntryPropsBase {
  useBackground?: boolean;
}

const IssueCover: React.FC<IssueCoverProps> = ({
  issue,
  useBackground = false,
}) => {
  const coverType = useBackground ? ("LA" as const) : ("RGB" as const);
  return (
    <div
      className={`IssueCover ${
        useBackground ? "IssueCover--bg" : "IssueCover--border"
      }`}
      style={{
        backgroundColor: useBackground
          ? `var(--paper-${issue.colour})`
          : "transparent",
      }}
    >
      <img
        alt={`Cover of Volume ${issue.volume_num} Issue ${issue.issue_code}`}
        className="IssueCover_img"
        srcSet={`${coverSrc(issue, 1, coverType)}, ${coverSrc(
          issue,
          2,
          coverType
        )} 2x`}
        src={coverSrc(issue, 1, coverType)}
      />
    </div>
  );
};

export type { IssueCoverProps };
export { IssueCover };
