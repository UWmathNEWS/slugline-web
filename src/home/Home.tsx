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

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import type { Issue, Pagination, RouteComponentProps } from "../shared/types";
import Visor from "../shared/components/Visor";
import Loader from "../shared/components/Loader";
import Dateline from "../shared/components/Dateline";
import Paginator from "../shared/components/Paginator";
import IssueEntry, { IssueEntryHero } from "../shared/components/IssueEntry";
import Hero from "../shared/components/Hero";

import "./styles/Home.scss";
import {
  inverseMode,
  resetThemeVariables,
  setThemeVariables,
  useTheme,
} from "../shared/contexts/ThemeContext";
import { withSSRData } from "../shared/hoc/withSSRData";

const taglines = [
  /* Contributed by terrifiED */
  "Fresh off the press",
  "Recently proved to exist",
  "Newly conjectured",
  "Our latest and greatest",
  "Thank Mr. Goose it's here",
  "Now with 100% less fibre",
  "Now with 100% more fibre",
  "Start your addiction today",
  "Comes with free bikini",
  "Proof of Imprint's inferiority",
  "Bring the editors pizza day",
  "Pissing off Imprint since 1973",
  "The issue you've been waiting for",
  "Just pushed to master",
  "This issue broke prod",
  "#1 among Russian spambots",
  "Your statistically significant other",
  "P(You read this) = 1",
  "This issue > last issue",
  "Math is fun, but we are funnier",
  "Your assignment can wait",
  "Now with less math and even less news",
  "#1 cause of procrastination among mathies",
  "What if you read this issue…haha jk…unless?",
  "10/10 mathies recommend mathNEWS (n = 10)",
  "The Dean loves us, apparently",
  "Now with a chance of actual journalism",
  // "Please read, for the jar of dirt in the office",
  "You came here for the profQUOTES, didn't you",
  "Made with copious amounts of coffee",
  "Proudly published from the 7th floor of MC",
  "Ceci n'est pas un slogan",
  "I ran out of jokes to put here",
  /* Contributed by god⚡peED */
  "Hot and ready",
  "Straight from the pizza oven",
  "Putting the funny in mathematically-themed journalism",
  /* Contributed by writer tendstofortytwo */
  "The prime factor behind my existence",
  "(cons mastHEAD insanity)",
  "Freshly Imprinted for you",
  "In a congruence class of its own",
] as const;

const HeroLoader: React.FC = () => {
  return (
    <>
      <Dateline>
        <Loader variant="linear" className="Hero_loaderDateline" />
      </Dateline>
      <Loader
        variant="linear"
        layout="display"
        className="Hero_loaderTitle h2 mt-1"
      />
      <Loader variant="linear" lines={3} className="Hero_loaderDesc mt-3" />
      <Loader variant="linear" className="Hero_loaderCta mt-3" />
    </>
  );
};

const HomeContent: React.FC<{
  data: [Pagination<Issue>, Issue];
  setLatestIssueRef: React.RefCallback<Issue>;
  location: string;
  page: number;
}> = ({ data, setLatestIssueRef, location, page }) => {
  const { mode } = useTheme();
  let issues = data[0];
  const latestIssue = data[1];
  let title = "";
  let heroType: string;
  let hero: React.ReactNode;

  setLatestIssueRef(latestIssue);

  useEffect(() => {
    setThemeVariables({
      secondaryBg: `var(--paper-${latestIssue.colour}-${mode})`,
      secondaryLink: `var(--paper-${latestIssue.colour}-${inverseMode[mode]})`,
    });
  }, [mode, latestIssue]);

  // On the first page, we want a full latest issue hero. However, on subsequent pages, we want a more subtle hero.
  if (page === 1) {
    issues.results = issues.results.filter(
      (issue) =>
        issue.volume_num !== latestIssue.volume_num &&
        issue.issue_code !== latestIssue.issue_code
    );
    heroType = "full";
    hero = (
      <IssueEntryHero
        issue={latestIssue}
        tagline={taglines[Math.floor(Math.random() * taglines.length)]}
        showCover
      />
    );
  } else {
    title = `Page ${page}`;
    heroType = "short";
    hero = <IssueEntryHero issue={latestIssue} tagline="Latest Issue" />;
  }

  return (
    <>
      <Visor key="visor" title={title} location={location} />
      <Hero key="hero" variant="theme" className={`Hero--${heroType}`}>
        {hero}
      </Hero>
      <div key="content" className="container mt-5" data-testid="home-content">
        {issues.results.map((issue, i) => (
          <IssueEntry key={i} issue={issue} className="mb-5" />
        ))}
        <Paginator pagination={issues} url={(page) => `/?paged=${page}`} />
      </div>
    </>
  );
};

const HomeLoading: React.FC<{
  data?: [Pagination<Issue>, any];
  latestIssue: Issue | null;
  location: string;
}> = ({ data, latestIssue, location }) => {
  return (
    <>
      <Visor key="visor" location={location} />
      <Hero key="hero" variant="theme" className="Hero--short">
        {latestIssue ? (
          <IssueEntryHero issue={latestIssue} tagline="Latest Issue" />
        ) : (
          <HeroLoader />
        )}
      </Hero>
      <div key="content" className="container mt-5" data-testid="home-content">
        <Loader variant="spinner" />
        {data && (
          <Paginator pagination={data[0]} url={(page) => `/?paged=${page}`} />
        )}
      </div>
    </>
  );
};

/**
 * The component for our home page.
 *
 * @param route The route in Public for the homepage
 * @param location The Location object from react-router
 * @param staticContext The static context passed from SSR
 */

const Home: React.FC<RouteComponentProps<any, [Pagination<Issue>, Issue]>> = ({
  route,
  location,
  staticContext,
}) => {
  const search = useMemo(() => new URLSearchParams(location.search), [
    location.search,
  ]);
  const page = parseInt(search.get("paged") || "") || 1;
  const fetchData = useCallback(
    () => route.loadData!({ query: { paged: page } }),
    [page, route.loadData]
  );
  // Store the latest issue so we don't show an unnecessary loader when changing pages
  // React's typings are a bit weird (useRef<T> with no initializer returns a MutableRefObject<T | undefined>, but we
  // want MutableRefObject<T | null>), which is why we have two explicit nulls here
  const latestIssueRef = useRef<Issue | null>(null);

  useEffect(() => resetThemeVariables, []);

  const RenderedComponent = withSSRData(
    [fetchData, staticContext?.data],
    HomeContent,
    undefined,
    HomeLoading
  );

  return (
    <RenderedComponent
      latestIssue={latestIssueRef.current}
      setLatestIssueRef={(issue) => {
        latestIssueRef.current = issue;
      }}
      location={location.pathname}
      page={page}
    />
  );
};

export default Home;
