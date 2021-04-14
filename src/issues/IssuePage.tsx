/**
 * goosePRESS is a news publishing platform.
 * Copyright (C) 2020  Kevin Trieu, Terry Chen
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

import React, { useCallback } from "react";
import { useParams } from "react-router-dom";
import { Issue, RouteComponentProps } from "../shared/types";
import Visor from "../shared/components/Visor";
import Loader from "../shared/components/Loader";
import { RequestState } from "../api/hooks";
import ErrorPage from "../shared/errors/ErrorPage";
import { useSSRData } from "../shared/hooks";

const IssuePage: React.FC<RouteComponentProps<any, Issue>> = ({
  route,
  location,
  staticContext,
}) => {
  const params = useParams<{ issue_id: string }>();

  const [issue, issueInfo, fail] = useSSRData(
    useCallback(() => route.loadData!({ params }), [params, route.loadData]),
    staticContext?.data
  );

  if (!fail && issue && issueInfo.state !== RequestState.Running) {
    return (
      <div className="container">
        <Visor
          key="visor"
          title={route.title}
          titleParams={[issue?.volume_num, issue?.issue_code]}
          location={location.pathname}
        />
        <h1>{`Volume ${issue?.volume_num} Issue ${issue?.issue_code}`}</h1>
      </div>
    );
  } else if (fail) {
    return <ErrorPage statusCode={issueInfo.statusCode || 500} />;
  } else {
    return (
      <>
        <Visor key="visor" location={location.pathname} />
        <Loader variant="spinner" />
      </>
    );
  }
};

export default IssuePage;
