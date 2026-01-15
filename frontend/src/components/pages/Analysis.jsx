import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";

const Analysis = () => {
  const { t } = useTranslation();
  return (
    <Fragment>
      <div className="fancy-feature-eighteen position-relative pt-200 pb-225 lg-pt-130 md-pt-100 xl-pb-150 lg-pb-100">
        <div className="container">
          <div className="row">
            <div className="col-xl-5 col-lg-6 col-md-7 ms-auto">
              <div className="block-style-two" data-aos="fade-left">
                <div className="title-style-three">
                  <div className="sc-title">Over 1000+ Client</div>
                  <h2 className="main-title">
                    <span>{t("AI 智能分析")}</span>
                    <br></br>
                    {t("提升投注精準度")}
                  </h2>
                </div>
                {/* /.title-style-three */}
                <p className="pt-20 pb-25 lg-pb-20">
                  {t(
                    "TOP X 旨在為用戶提供最專業的分析工具。從龐大的數據庫到實時比賽推薦，我們幫助用戶快速掌握高勝率投注機會，讓勝率最大化。",
                  )}
                </p>
                <ul className="style-none list-item color-rev">
                  <li>{t("快速處理複雜數據，提供即時分析結果。")}</li>
                  <li>{t("全面覆蓋香港賽馬會的讓球盤市場。")}</li>
                  <li>{t("操作簡單，新手也能輕鬆上手。")}</li>
                </ul>
                {/* <a href="about-us2.html" className="btn-eight mt-50 lg-mt-30">More about us</a> */}
              </div>
              {/* /.block-style-two */}
            </div>
          </div>
        </div>

        <div className="illustration-holder" data-aos="fade-right">
          <img
            src="/images/assets/ils_14.svg"
            alt="Illustration"
            className="w-100 main-illustration"
            onError={(e) => {
              console.error('Failed to load image: /images/assets/ils_14.svg');
            }}
          />
          <img
            src="/images/assets/ils_14_1.svg"
            alt="Shape"
            className="shapes shape-one"
            data-aos="fade-down"
            onError={(e) => {
              console.error('Failed to load image: /images/assets/ils_14_1.svg');
            }}
          />
          <img
            src="/images/assets/ils_14_2.svg"
            alt="Shape"
            className="shapes shape-two"
            data-aos="fade-down"
            data-aos-delay={100}
            onError={(e) => {
              console.error('Failed to load image: /images/assets/ils_14_2.svg');
            }}
          />
          <img
            src="/images/assets/ils_14_3.svg"
            alt="Shape"
            className="shapes shape-three"
            data-aos="fade-down"
            data-aos-delay={200}
            onError={(e) => {
              console.error('Failed to load image: /images/assets/ils_14_3.svg');
            }}
          />
          <img
            src="/images/assets/ils_14_4.svg"
            alt="Shape"
            className="shapes shape-four"
            onError={(e) => {
              console.error('Failed to load image: /images/assets/ils_14_4.svg');
            }}
          />
          <img
            src="/images/assets/ils_14_5.svg"
            alt="Shape"
            className="shapes shape-five"
            onError={(e) => {
              console.error('Failed to load image: /images/assets/ils_14_5.svg');
            }}
          />
          <img
            src="/images/assets/ils_14_6.svg"
            alt="Shape"
            className="shapes shape-six"
            onError={(e) => {
              console.error('Failed to load image: /images/assets/ils_14_6.svg');
            }}
          />
          <img
            src="/images/assets/ils_14_7.svg"
            alt="Shape"
            className="shapes shape-seven"
            onError={(e) => {
              console.error('Failed to load image: /images/assets/ils_14_7.svg');
            }}
          />
        </div>
        {/* /.illustration-holder */}
        <div className="shapes oval-one" />
        <div className="shapes oval-two" />
        <div className="shapes oval-three" />
      </div>
    </Fragment>
  );
};

export default Analysis;
