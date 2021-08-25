/**
 * goosePRESS is a news publishing platform.
 * Copyright (C) 2020-2021  Terry Chen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
          : "var(--paper-paper)",
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
