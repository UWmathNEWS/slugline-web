import React from "react";
import { Helmet } from "react-helmet";
import { format, makeTitle, url } from "../helpers";
import config from "../../config";

interface VisorProps {
  title?: string;
  titleParams?: any;
  location?: string;
  article?: boolean;
  seo?: {
    description?: string;
    image?: string;
    og?: Record<string, string>;
    twitter?: Record<string, string>;
    structuredData?: Record<string, any>;
  };
}

export const BaseVisor = () => {
  return (
    <Helmet>
      <title>{makeTitle()}</title>

      <meta name="description" content={config.description} />

      <link rel="icon" href={url.resolve("/", config.icons.favicon.src)} />
      <link
        rel="apple-touch-icon"
        href={url.resolve("/", config.icons.touchIcon.src)}
      />
      <meta name="theme-color" content={config.themeColor} />

      {/* BEGIN SEO */}
      <meta property="og:title" content={makeTitle()} />
      <meta property="og:site_name" content={config.title} />
      <meta property="og:description" content={config.description} />
      <meta property="og:url" content={config.baseurl} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={config.seo.image} />
      <meta property="og:locale" content={config.locale} />
      {config.alternateLocales.length > 0 && (
        <meta
          property="og:locale:alternate"
          content={JSON.stringify(config.alternateLocales)}
        />
      )}

      <meta property="twitter:card" content={config.seo.twitter.card} />
      <meta property="twitter:title" content={makeTitle()} />
      <meta property="twitter:description" content={config.description} />
      <meta property="twitter:site" content={config.seo.twitter.site} />
      <meta property="twitter:url" content={config.baseurl} />
      <meta property="twitter:image" content={config.seo.image} />

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          url: config.baseurl,
          logo: url.resolve(config.baseurl, config.icons.favicon.src),
        })}
      </script>
      {/* END SEO */}

      {config.googleSiteVerification && (
        <meta
          name="google-site-verification"
          content={config.googleSiteVerification}
        />
      )}
    </Helmet>
  );
};

const Visor: React.FC<VisorProps> = (props) => {
  const title = format(props.title || "", props.titleParams);
  const location = url.resolve(config.baseurl, props.location || "");
  return (
    <Helmet>
      <title>{makeTitle(title)}</title>

      <link rel="canonical" href={location} />

      <meta property="og:title" content={title} />
      <meta property="og:url" content={location} />
      {props.seo?.description && (
        <meta property="og:description" content={props.seo.description} />
      )}
      {props.seo?.image && (
        <meta property="og:image" content={props.seo.image} />
      )}

      {props.seo?.og &&
        Object.entries(props.seo?.og).map(([prop, content], key) => (
          <meta key={key} property={`og:${prop}`} content={content} />
        ))}

      <meta property="twitter:title" content={title} />
      <meta property="twitter:url" content={location} />
      {props.seo?.description && (
        <meta property="twitter:description" content={props.seo.description} />
      )}
      {props.seo?.image && (
        <meta property="twitter:image" content={props.seo.image} />
      )}

      {props.seo?.twitter &&
        Object.entries(props.seo?.twitter).map(([prop, content], key) => (
          <meta key={key} property={`twitter:${prop}`} content={content} />
        ))}

      {props.seo?.structuredData && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            ...props.seo.structuredData,
          })}
        </script>
      )}
    </Helmet>
  );
};

export default Visor;
