import React, { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";

const HeroBanner = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const OpenModal = () => {
    setOpen(!open);
  };
  return (
    <Fragment>
      {/* <ModalVideos isOpen={open} onClick={OpenModal} /> */}
      <div className="hero-banner-five" id="homePage">
        <div className="container">
          <div className="row">
            <div className="col-xxl-6 col-md-7">
              <h1 className="hero-heading">
                <span>{t("專業級")}</span> {t("AI 分析!")}
                <br></br>
                {t("快速、簡單，讓您隨時隨地掌控大局")}
              </h1>
              <p className="text-lg mb-50 pt-40 pe-xl-5 md-pt-30 md-mb-40">
                {t(
                  "我們的技術不僅提供精確的賽事分析，系統還包含 23,835 支球隊的全面數據，結合最新AI人工智慧分析，推薦最佳投注策略，讓您輕鬆掌控全局。",
                )}
              </p>
              <ul className="style-none button-group d-flex align-items-center">
                <li className="me-4">
                  <a
                    href="https://t.me/topxhkai"
                    target="_blank"
                    className="demo-btn ripple-btn tran3s"
                  >
                    {t("聯絡我們")}
                  </a>
                </li>
                {/* <li><a className="fancybox video-icon tran3s" data-fancybox href="#" onClick={OpenModal} ><i className="fas fa-play" /></a></li> */}
              </ul>
            </div>
          </div>
        </div>{" "}
        {/* /.container */}
        <div className="illustration-holder">
          <img
            src="images/assets/ils_13.svg"
            alt=""
            className="main-illustration ms-auto"
          />
          <img
            src="images/assets/ils_13_1.svg"
            alt=""
            className="shapes shape-one"
          />
          <img
            src="images/assets/ils_13_2.svg"
            alt=""
            className="shapes shape-two"
            data-aos="fade-down"
          />
          <img
            src="images/assets/ils_13_2.svg"
            alt=""
            className="shapes shape-three"
            data-aos="fade-down"
          />
        </div>{" "}
        {/* /.illustration-holder */}
        <div className="shapes oval-one" />
      </div>{" "}
      {/* /.hero-banner-five */}
    </Fragment>
  );
};

export default HeroBanner;
