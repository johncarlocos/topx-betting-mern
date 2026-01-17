import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const PortfolioContent = (t) => [
  {
    img: "image1",
    tag: t("社群分享"),
    link: "https://t.me/topxhk_ai",
    hasRing: false,
    hasNotification: false,
  },
  {
    img: "image2",
    tag: t("動態更新"),
    link: "https://www.instagram.com/topxhk.ai/",
    hasRing: false,
    hasNotification: false,
  },
  {
    img: "image3",
    tag: t("分析紀錄"),
    link: "https://www.threads.com/@topxhk.ai",
    hasRing: true, // Blue ring around this one
    hasNotification: false,
  },
  {
    img: "image4",
    tag: t("每日賽事記錄"),
    link: "/match-records",
    hasRing: false,
    hasNotification: true, // Blue dot notification
  },
];

const PortfolioGallery = () => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <style>{`
        .portfolio-grid-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        
        .portfolio-grid-item {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .portfolio-grid-item .portfolio-text {
          text-align: center;
          margin-top: 12px;
          color: white;
          font-size: 16px;
          font-weight: 500;
          position: relative;
          width: 100%;
        }
        
        .portfolio-card-image {
          position: relative;
          width: 100%;
          padding-top: 100%;
          border-radius: 12px;
          overflow: hidden;
          background-color: #1a1a1a;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        /* Tablet (768px - 991px) */
        @media (max-width: 991px) and (min-width: 768px) {
          .portfolio-grid-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            max-width: 700px;
            padding: 30px 20px;
          }
          
          .portfolio-grid-item .portfolio-text {
            font-size: 15px;
          }
        }
        
        /* Mobile (max-width: 767px) */
        @media (max-width: 767px) {
          .portfolio-grid-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            max-width: 100%;
            padding: 20px 15px;
          }
          
          .portfolio-grid-item .portfolio-text {
            font-size: 14px;
            margin-top: 10px;
          }
          
          .portfolio-card-image {
            border-radius: 10px;
          }
        }
        
        /* Very small mobile (max-width: 480px) */
        @media (max-width: 480px) {
          .portfolio-grid-container {
            gap: 12px;
            padding: 15px 10px;
          }
          
          .portfolio-grid-item .portfolio-text {
            font-size: 12px;
            margin-top: 8px;
          }
          
          .portfolio-card-image {
            border-radius: 8px;
          }
        }
      `}</style>
      <div className="portfolio-grid-container">
        {PortfolioContent(t).map((val, i) => {
          const isExternalLink = val.link.startsWith("http");
          const LinkComponent = isExternalLink ? "a" : Link;
          const linkProps = isExternalLink
            ? { href: val.link, target: "_blank", rel: "noopener noreferrer" }
            : { to: val.link };

          return (
            <div key={i} className="portfolio-grid-item">
              <LinkComponent
                {...linkProps}
                style={{
                  textDecoration: "none",
                  width: "100%",
                  position: "relative",
                  display: "block",
                }}
              >
                <div
                  className="portfolio-card-image"
                  style={{
                    boxShadow: val.hasRing
                      ? "0 0 0 3px #0496ff, 0 4px 12px rgba(0, 0, 0, 0.3)"
                      : "0 4px 12px rgba(0, 0, 0, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    if (window.innerWidth > 767) {
                      e.currentTarget.style.transform = "scale(1.05)";
                      e.currentTarget.style.boxShadow = val.hasRing
                        ? "0 0 0 3px #0496ff, 0 6px 20px rgba(0, 0, 0, 0.4)"
                        : "0 6px 20px rgba(0, 0, 0, 0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (window.innerWidth > 767) {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = val.hasRing
                        ? "0 0 0 3px #0496ff, 0 4px 12px rgba(0, 0, 0, 0.3)"
                        : "0 4px 12px rgba(0, 0, 0, 0.3)";
                    }
                  }}
                  onTouchStart={(e) => {
                    if (window.innerWidth <= 767) {
                      e.currentTarget.style.opacity = "0.8";
                    }
                  }}
                  onTouchEnd={(e) => {
                    if (window.innerWidth <= 767) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                >
                  <img
                    src={`/images/gallery/${val.img}.jpg`}
                    alt={val.tag}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      console.error(`Failed to load image: /images/gallery/${val.img}.jpg`);
                      e.target.style.display = "none";
                    }}
                  />
                  {val.hasNotification && (
                    <div
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        width: "12px",
                        height: "12px",
                        backgroundColor: "#0496ff",
                        borderRadius: "50%",
                        border: "2px solid #1a1a1a",
                        boxShadow: "0 0 4px rgba(4, 150, 255, 0.6)",
                      }}
                    />
                  )}
                </div>
              </LinkComponent>
              <div className="portfolio-text">
                {val.tag}
                {val.hasNotification && (
                  <span
                    style={{
                      display: "inline-block",
                      width: "6px",
                      height: "6px",
                      backgroundColor: "#0496ff",
                      borderRadius: "50%",
                      marginLeft: "6px",
                      verticalAlign: "middle",
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Fragment>
  );
};

export default PortfolioGallery;
