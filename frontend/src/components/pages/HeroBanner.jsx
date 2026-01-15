import React, { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import useSocialLinks from "../../hooks/useSocialLinks";
import homeVideo from "../../assets/images/assets/home.mp4";

const HeroBanner = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { socialLinks } = useSocialLinks();
  const OpenModal = () => {
    setOpen(!open);
  };

  const isSmartphone = () => {
    return window.innerWidth <= 767;
  };

  const getBottomStyle = () => {
    return isSmartphone() ? -70 : 0;
  };
  return (
    <Fragment >
      {/* <ModalVideos isOpen={open} onClick={OpenModal} /> */}
      <div className="hero-banner-five" id="homePage" style={{ bottom: getBottomStyle(), top: -40 }}>
        <div className="container">
          <div className="row">
            <div className="col-xxl-6 col-md-7">
              <h1 className="hero-heading">
                <span>{t("專業級")}</span> {t("AI 分析!")}
                <br></br>
                {t("快速、簡單，讓您隨時隨地掌控大局")}
              </h1>
              <p className="text-lg mb-50 pt-40 pe-xl-5 md-pt-30 md-mb-10">
                {t(
                  "我們的技術不僅提供精確的賽事分析，系統還包含 23,835 支球隊的全面數據，結合最新AI人工智慧分析，推薦最佳投注策略，讓您輕鬆掌控全局。",
                )}
              </p>
              <ul className="style-none button-group d-flex align-items-center">
                <li className="me-4">
                  <a
                    className="btn-eight ripple-btn pointer-events-none cursor-default"
                    href="https://t.me/topxhkai"
                    target="_blank"
                    style={{
                      paddingLeft: 14,
                      paddingRight: 14,
                      transition: "none",
                    }}
                  >
                    {t("聯絡我們") + "   ➡️"}
                  </a>
                </li>
                {/* <a
                  onClick={() => {
                    const url = socialLinks?.whatsapp ?? "/";
                    const width = 1000;
                    const height = 1000;
                    const left = window.screen.width - width - 20;
                    const top = window.screen.height - height - 20;
                    window.open(url, "whatsappWindow", `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`);
                  }}
                  rel="noopener noreferrer">
                  <img
                    src="/images/media/whatsapp.png"
                    alt="WhatsApp"
                    style={{
                      width: 54,
                      height: 54,
                      objectFit: "contain",
                      marginRight: 14,
                      cursor: "pointer"
                    }}
                  />
                </a>

                <a
                  onClick={() => {
                    const url = socialLinks?.telegram ?? "/";
                    const width = 1000;
                    const height = 1000;
                    const left = window.screen.width - width - 20;
                    const top = window.screen.height - height - 20;
                    window.open(url, "telegramWindow", `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`);
                  }}
                  rel="noopener noreferrer">
                  <img
                    src="/images/media/telegram.png"
                    alt="Telegram"
                    style={{
                      width: 54,
                      height: 54,
                      objectFit: "contain",
                      marginRight: 14,
                      cursor: "pointer"
                    }}
                  />
                </a> */}

                {/* <li><a className="fancybox video-icon tran3s" data-fancybox href="#" onClick={OpenModal} ><i className="fas fa-play" /></a></li> */}
              </ul>
            </div>
          </div>
        </div>{" "}
        {/* /.container */}


        <div className="illustration-holder" >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="main-illustration ms-auto"
            style={{ width: '100%', height: 'auto' }}
          >
            <source src={homeVideo} type="video/mp4" />
            <source src="/images/assets/home.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="shapes oval-one" style={{ bottom: 70 }} />
      </div>
    </Fragment>
  );
};

export default HeroBanner;
