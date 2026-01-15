import React from "react";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();
  return (
    <>
      <div
        className="fancy-feature-twentyOne mt-200 lg-mt-120 pb-200 lg-pb-50"
        id="contactUs"
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-md-7 ms-auto">
              <div className="block-style-five ps-xxl-5" data-aos="fade-left">
                <div className="title-style-three">
                  <div className="sc-title">Contact us</div>
                  <h2 className="main-title">
                    <span>{t("專屬於您的")}</span> {t("AI 足球分析解決方案")}。
                  </h2>
                </div>
                {/* /.title-style-three */}
                <p className="pt-20 pb-15">
                  {t(
                    "TOP X 提供快速、精準的足球分析服務，結合最新 AI 技術和全面的比賽數據，讓每一次投注更具信心！",
                  )}
                </p>
                <a
                  href="https://t.me/topxhkai"
                  target="_blank"
                  className="btn-eight ripple-btn"
                >
                  {t("立即探索 TOP X")}
                </a>
              </div>
              {/* /.block-style-five */}
            </div>
          </div>
        </div>
        <div className="illustration-holder" data-aos="fade-right">
          <img
            src="/images/assets/ils_16.svg"
            alt="Contact Illustration"
            className="w-100 main-illustration"
            onError={(e) => {
              console.error('Failed to load image: /images/assets/ils_16.svg');
            }}
          />
        </div>
        {/* /.illustration-holder */}
        {/* <img src="images/shape/shape_37.svg" alt="" className="shapes shape-one"/> */}
        <div className="shapes oval-one" />
        <div className="shapes oval-two" />
      </div>
    </>
  );
};

export default Contact;
