import React from "react";
import { Helmet } from "react-helmet";
import { makeTitle, url } from "../helpers";
import config from "../../config";

interface VisorProps {
  title?: string;
  titleParams?: any;
  location?: string;
}

export const BaseVisor = () => {
  return (
    <Helmet>
      <title>{makeTitle()}</title>

      <meta name="description" content={config.description} />

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          url: config.baseurl,
          logo: url.resolve(config.baseurl, config.favicon)
        })}
      </script>
    </Helmet>
  );
};

const Visor: React.FC<VisorProps> = ({ title, titleParams, location }) => {
  return (
    <Helmet>
      <title>{makeTitle(title, titleParams)}</title>

      <link
        rel="canonical"
        href={url.resolve(config.baseurl, location || "")}
      />
    </Helmet>
  );
};

export default Visor;
