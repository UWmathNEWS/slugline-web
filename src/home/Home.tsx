import React, { useCallback, useMemo, useRef } from "react";
import { Helmet } from "react-helmet";
import type { Issue, Pagination, RouteComponentProps } from "../shared/types";
import { useSSRData } from "../shared/hooks";
import { RequestState } from "../api/hooks";
import ErrorPage from "../shared/errors/ErrorPage";
import Visor from "../shared/components/Visor";
import Loader from "../shared/components/Loader";
import Dateline from "../shared/components/Dateline";
import Paginator from "../shared/components/Paginator";
import IssueEntry, { IssueEntryHero } from "../shared/components/IssueEntry";

import "./styles/Home.scss";
import Hero from "../shared/components/Hero";

const taglines = [
  /* Contributed by terrifiED */
  "Fresh off the press",
  "Recently proved to exist",
  "Newly conjectured",
  "Our latest and greatest",
  "Thank Mr. Goose it's here",
  "Now with 100% less fibre",
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
  "#1 cause of procrastination among mathematicians",
  "What if you read this issue…haha jk…unless?",
  "10/10 mathematicians recommend mathNEWS (n = 10)",
  "The Dean loves us, apparently",
  "Now with a chance of actual journalism",
  // "Please read, for the jar of dirt in the office",
  "You came here for the profQUOTES, didn't you",
  "Made with copious amounts of coffee",
  "Proudly published from the 7th floor of MC",
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
      <Loader variant="linear" className="Hero_loaderTitle h2 mt-1" />
      <Loader variant="linear" className="Hero_loaderDesc mt-3" />
      <Loader variant="linear" className="Hero_loaderDesc" />
      <Loader variant="linear" className="Hero_loaderDesc" />
      <Loader variant="linear" className="Hero_loaderCta mt-3" />
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
  const [resp, reqInfo, fail] = useSSRData(
    useCallback(() => route.loadData!({ query: { paged: page } }), [
      page,
      route.loadData,
    ]),
    staticContext?.data
  );
  // Store the latest issue so we don't show an unnecessary loader when changing pages
  const latestIssueRef = useRef<Issue>();

  if (!fail && resp && reqInfo.state !== RequestState.Running) {
    let issues = resp[0];
    const latestIssue = resp[1];
    let title = "";
    let heroType: string;
    let hero: React.ReactNode;

    latestIssueRef.current = latestIssue;

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
        <Visor key="visor" title={title} location={location.pathname} />
        <Helmet>
          {/* We want the navbar to share the issue's colour */}
          <style key="nav-style">
            {`.SluglineNav, .Hero {
              --background-clr: var(--paper-${latestIssue.colour}-light) !important;
            }`}
          </style>
        </Helmet>
        <Hero key="hero" variant="custom" className={`Hero--${heroType}`}>
          {hero}
        </Hero>
        <div
          key="content"
          className="container mt-5"
          data-testid="home-content"
        >
          {issues.results.map((issue, i) => (
            <IssueEntry key={i} issue={issue} className="mb-5" />
          ))}
          <Paginator pagination={issues} url={(page) => `/?paged=${page}`} />
        </div>
      </>
    );
  } else if (fail) {
    return <ErrorPage statusCode={reqInfo.statusCode || 500} />;
  } else {
    return (
      <>
        <Visor key="visor" location={location.pathname} />
        <Helmet>
          {/* We want to preserve the latest issue's colour */}
          <style key="nav-style">
            {`.SluglineNav, .Hero {
              --background-clr: var(--paper-${
                latestIssueRef.current?.colour || "paper"
              }-light) !important;
            }`}
          </style>
        </Helmet>
        <Hero key="hero" variant="custom" className="Hero--short">
          {latestIssueRef.current ? (
            <IssueEntryHero
              issue={latestIssueRef.current}
              tagline="Latest Issue"
            />
          ) : (
            <HeroLoader />
          )}
        </Hero>
        <div
          key="content"
          className="container mt-5"
          data-testid="home-content"
        >
          <Loader variant="spinner" />
          {resp && (
            <Paginator pagination={resp[0]} url={(page) => `/?paged=${page}`} />
          )}
        </div>
      </>
    );
  }
};

export default Home;
