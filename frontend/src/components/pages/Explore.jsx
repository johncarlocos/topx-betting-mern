import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ServiceContent = (t) => [
  {
    icon: "icon_31",
    title: t("數據研究"),
    desc: t("運用全面球隊數據，通過 AI 演算法選出高勝率的比賽。"),
    arrow: "icon_20",
    datadelay: "",
    dataAos: "fade-right",
    className: "",
  },
  {
    icon: "icon_32",
    title: t("賽事條件評估"),
    desc: t(
      "分析最新球員狀態與球隊動態，結合天氣、賽場條件、傷病情況等外部因素，為用戶提供綜合性建議。",
    ),
    arrow: "icon_20",
    datadelay: "100",
    dataAos: "fade-up",
    className: "active",
  },
  {
    icon: "icon_33",
    title: t("比賽結果模擬"),
    desc: t("TOP X通過模擬不同比賽場景，提供最佳投注結果。"),
    arrow: "icon_20",
    dataDelay: "",
    dataAos: "fade-left",
    className: "",
  },
];
const Explore = () => {
  const { t } = useTranslation();
  return (
    <Fragment>
      <div className="row justify-content-center pt-30">
        {ServiceContent(t).map((val, i) => (
          <div
            key={i}
            className="col-lg-4 col-md-6"
            data-aos={val.dataAos}
            data-aos-delay={val.dataDelay}
          >
            <div
              className={`block-style-twelve block-space mt-30 ${val.className}`}
            >
              <div className="icon d-flex align-items-end mb-20">
                <img 
                  src={`/images/icon/${val.icon}.svg`} 
                  alt={val.title}
                  onError={(e) => {
                    console.error(`Failed to load icon: /images/icon/${val.icon}.svg`);
                  }}
                />
              </div>
              <h5>
                {val.title}
              </h5>
              <p>{val.desc}</p>
              {/* <Link to="/service-details" className="tran3s more-btn"><img src="images/icon/icon_20.svg" alt=""/></Link> */}
            </div>
            {/* /.block-style-twelve */}
          </div>
        ))}
      </div>
    </Fragment>
  );
};

export default Explore;
